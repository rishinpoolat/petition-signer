-- Users table to store petitioner information
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio_id VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Petitions table
CREATE TABLE petitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    petitioner_id INT NOT NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    signature_threshold INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response TEXT,
    FOREIGN KEY (petitioner_id) REFERENCES users(id)
);

-- Signatures table
CREATE TABLE signatures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    petition_id INT NOT NULL,
    user_id INT NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (petition_id) REFERENCES petitions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_signature (petition_id, user_id)
);

-- Valid BioIDs table
CREATE TABLE valid_bio_ids (
    bio_id VARCHAR(10) PRIMARY KEY,
    is_used BOOLEAN DEFAULT FALSE
);

-- Insert the provided valid BioIDs
INSERT INTO valid_bio_ids (bio_id) VALUES
('K1YL8VA2HG'),('7DMPYAZAP2'),('D05HPPQNJ4'),('2WYIM3QCK9'),
('DHKFIYHMAZ'),('LZK7P0X0LQ'),('H5C98XCENC'),('6X6I6TSUFG'),
('QTLCWUS8NB'),('Y4FC3F9ZGS'),('V30EPKZQI2'),('O3WJFGR5WE'),
('SEIQTS1H16'),('X16V7LFHR2'),('TLFDFY7RDG'),('PGPVG5RF42'),
('FPALKDEL5T'),('2BIB99Z54V'),('ABQYUQCQS2'),('9JSXWO4LGH');