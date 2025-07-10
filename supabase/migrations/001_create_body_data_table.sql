-- Create body_data table for storing body composition data
CREATE TABLE IF NOT EXISTS body_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight <= 300),
    bmi DECIMAL(4,2) CHECK (bmi > 0 AND bmi <= 100),
    body_fat DECIMAL(4,2) CHECK (body_fat >= 0 AND body_fat <= 100),
    muscle_mass DECIMAL(5,2) CHECK (muscle_mass >= 0 AND muscle_mass <= 200),
    visceral_fat DECIMAL(4,2) CHECK (visceral_fat >= 0 AND visceral_fat <= 50),
    calories INTEGER CHECK (calories >= 0 AND calories <= 10000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on date to prevent duplicate entries per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_body_data_date ON body_data(date);

-- Create index on created_at for performance
CREATE INDEX IF NOT EXISTS idx_body_data_created_at ON body_data(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_body_data_updated_at ON body_data;
CREATE TRIGGER update_body_data_updated_at
    BEFORE UPDATE ON body_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO body_data (date, weight, bmi, body_fat, muscle_mass, visceral_fat, calories) VALUES
    ('2024-01-15', 70.5, 22.1, 15.2, 55.3, 8.5, 2200),
    ('2024-01-14', 70.8, 22.2, 15.4, 55.1, 8.6, 2180),
    ('2024-01-13', 71.0, 22.3, 15.6, 54.9, 8.8, 2250)
ON CONFLICT (date) DO NOTHING;