-- Create user role enum
CREATE TYPE user_role AS ENUM ('student', 'employer', 'admin');

-- Create action type enum
CREATE TYPE action_type AS ENUM ('like', 'pass');

-- 1. Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create opportunities table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    requirements TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create interactions table
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    action action_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraint to avoid duplicate swipes on the same combination
    CONSTRAINT unique_interaction UNIQUE (sender_id, target_id, opportunity_id)
);

-- 4. Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    compliance_status JSONB DEFAULT '{"university_approval": "pending", "visa_status": "pending", "travel_docs": "pending"}'::jsonb NOT NULL,
    progress_percentage INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Unique match rule
    CONSTRAINT unique_match UNIQUE (student_id, opportunity_id)
);

-- Create match calculation function
CREATE OR REPLACE FUNCTION calculate_progress_percentage(compliance_status JSONB)
RETURNS INTEGER AS $$
DECLARE
    approved_count INTEGER := 0;
    total_count INTEGER := 3; -- university_approval, visa_status, travel_docs
BEGIN
    IF compliance_status->>'university_approval' = 'approved' THEN
        approved_count := approved_count + 1;
    END IF;
    IF compliance_status->>'visa_status' = 'approved' THEN
        approved_count := approved_count + 1;
    END IF;
    IF compliance_status->>'travel_docs' = 'approved' THEN
        approved_count := approved_count + 1;
    END IF;

    RETURN (approved_count * 100) / total_count;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create interaction trigger function to handle mutual matches
CREATE OR REPLACE FUNCTION trigger_check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
    reciprocal_exists BOOLEAN;
    employer_uuid UUID;
BEGIN
    -- Only trigger mutual check on 'like' action
    IF NEW.action = 'like' THEN
        -- Resolve employer ID of target opportunity (if sender is student swiping on opportunity)
        IF NEW.opportunity_id IS NOT NULL THEN
            SELECT employer_id INTO employer_uuid
            FROM opportunities
            WHERE id = NEW.opportunity_id;

            -- Look for matching 'like' swipe from the employer target to this student sender
            SELECT EXISTS (
                SELECT 1 FROM interactions
                WHERE sender_id = employer_uuid
                  AND target_id = NEW.sender_id
                  AND action = 'like'
            ) INTO reciprocal_exists;

            IF reciprocal_exists THEN
                INSERT INTO matches (student_id, opportunity_id, compliance_status, progress_percentage)
                VALUES (
                    NEW.sender_id,
                    NEW.opportunity_id,
                    '{"university_approval": "pending", "visa_status": "pending", "travel_docs": "pending"}'::jsonb,
                    0
                ) ON CONFLICT (student_id, opportunity_id) DO NOTHING;
            END IF;

        -- Alternatively, if sender is employer swiping on a student target_id
        ELSE
            -- Check if any of employer's opportunities have been 'liked' by this student
            -- Find student swiped liked on employer opportunities
            FOR NEW.opportunity_id IN
                SELECT id FROM opportunities WHERE employer_id = NEW.sender_id
            LOOP
                SELECT EXISTS (
                    SELECT 1 FROM interactions
                    WHERE sender_id = NEW.target_id
                      AND opportunity_id = NEW.opportunity_id
                      AND action = 'like'
                ) INTO reciprocal_exists;

                IF reciprocal_exists THEN
                    INSERT INTO matches (student_id, opportunity_id, compliance_status, progress_percentage)
                    VALUES (
                        NEW.target_id,
                        NEW.opportunity_id,
                        '{"university_approval": "pending", "visa_status": "pending", "travel_docs": "pending"}'::jsonb,
                        0
                    ) ON CONFLICT (student_id, opportunity_id) DO NOTHING;
                END IF;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the trigger function on interactions insert
CREATE TRIGGER on_interaction_insert
AFTER INSERT ON interactions
FOR EACH ROW
EXECUTE FUNCTION trigger_check_and_create_match();

-- Automatically update progress_percentage upon compliance_status mutation in matches
CREATE OR REPLACE FUNCTION trigger_update_match_progress()
RETURNS TRIGGER AS $$
BEGIN
    NEW.progress_percentage := calculate_progress_percentage(NEW.compliance_status);
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_compliance_update
BEFORE INSERT OR UPDATE OF compliance_status ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_update_match_progress();
