/**
 * Migration: Add NCERT Educational Ebooks
 * Purpose: Add 16 NCERT textbooks for Class 9-12 to the media library
 * Date: 2026-01-21
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function up() {
  console.log('Adding NCERT ebooks to media table...');
  
  try {
    // Insert NCERT ebooks with ON CONFLICT DO NOTHING to make it idempotent
    await query(`
      INSERT INTO media (title, type, format, duration, description, total_copies, available_copies, location, access_url) VALUES
      ('NCERT Mathematics Class 10', 'ebook', 'PDF', NULL, 'NCERT Mathematics textbook for Class 10 - Complete curriculum covering Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, and Statistics.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?jemh1=0-8'),
      ('NCERT Science Class 10', 'ebook', 'PDF', NULL, 'NCERT Science textbook for Class 10 - Covers Chemical Reactions and Equations, Acids, Bases and Salts, Metals and Non-metals, Carbon and its Compounds, Life Processes, Control and Coordination, Heredity and Evolution, Light, Electricity, and more.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?jesc1=0-13'),
      ('NCERT Physics Class 11', 'ebook', 'PDF', NULL, 'NCERT Physics Part 1 for Class 11 - Comprehensive coverage of Physical World, Units and Measurements, Motion in a Straight Line, Motion in a Plane, Laws of Motion, Work Energy and Power, System of Particles and Rotational Motion, and Gravitation.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?keph1=0-8'),
      ('NCERT Chemistry Class 11', 'ebook', 'PDF', NULL, 'NCERT Chemistry Part 1 for Class 11 - Covers Structure of Atom, Classification of Elements, Chemical Bonding, States of Matter, Thermodynamics, Equilibrium, Redox Reactions, and Organic Chemistry basics.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?kech1=0-14'),
      ('NCERT Biology Class 11', 'ebook', 'PDF', NULL, 'NCERT Biology for Class 11 - Diversity in Living World, Structural Organisation in Animals and Plants, Cell Structure and Function, Plant Physiology, and Human Physiology.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?kebo1=0-22'),
      ('NCERT Mathematics Class 12', 'ebook', 'PDF', NULL, 'NCERT Mathematics Part 1 & 2 for Class 12 - Advanced topics including Relations and Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity and Differentiability, Applications of Derivatives, Integrals, Applications of Integrals, Differential Equations, Vectors, Three Dimensional Geometry, Linear Programming, and Probability.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?lemh1=0-16'),
      ('NCERT Physics Class 12', 'ebook', 'PDF', NULL, 'NCERT Physics Part 1 & 2 for Class 12 - Electric Charges and Fields, Electrostatic Potential and Capacitance, Current Electricity, Magnetic Effects of Current, Magnetism and Matter, Electromagnetic Induction, Alternating Current, Electromagnetic Waves, Ray Optics, Wave Optics, Dual Nature of Radiation, Atoms, Nuclei, and Semiconductor Electronics.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?leph1=0-15'),
      ('NCERT Chemistry Class 12', 'ebook', 'PDF', NULL, 'NCERT Chemistry Part 1 & 2 for Class 12 - Solutions, Electrochemistry, Chemical Kinetics, Surface Chemistry, General Principles of Isolation of Elements, p-Block Elements, d and f Block Elements, Coordination Compounds, Haloalkanes and Haloarenes, Alcohols Phenols and Ethers, Aldehydes Ketones and Carboxylic Acids, Amines, Biomolecules, and Polymers.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?lech1=0-16'),
      ('NCERT Biology Class 12', 'ebook', 'PDF', NULL, 'NCERT Biology for Class 12 - Reproduction in Organisms, Sexual Reproduction in Flowering Plants, Human Reproduction, Reproductive Health, Principles of Inheritance and Variation, Molecular Basis of Inheritance, Evolution, Human Health and Disease, Strategies for Enhancement in Food Production, Microbes in Human Welfare, Biotechnology, Organisms and Populations, Ecosystem, Biodiversity and Conservation, and Environmental Issues.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?lebo1=0-16'),
      ('NCERT English Beehive Class 9', 'ebook', 'PDF', NULL, 'NCERT English Beehive textbook for Class 9 - Collection of prose and poetry including works by various authors, designed to enhance reading comprehension and literary appreciation.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?ieen1=0-14'),
      ('NCERT History - India and the Contemporary World Class 9', 'ebook', 'PDF', NULL, 'NCERT History textbook for Class 9 - The French Revolution, Socialism in Europe and Russian Revolution, Nazism and the Rise of Hitler, Forest Society and Colonialism, Pastoralists in the Modern World.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?iess1=0-5'),
      ('NCERT Economics - Understanding Economic Development Class 10', 'ebook', 'PDF', NULL, 'NCERT Economics textbook for Class 10 - Development, Sectors of Indian Economy, Money and Credit, Globalization and Indian Economy, Consumer Rights.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?jess4=0-5'),
      ('NCERT Social Science - Democratic Politics Class 10', 'ebook', 'PDF', NULL, 'NCERT Political Science textbook for Class 10 - Power Sharing, Federalism, Democracy and Diversity, Gender Religion and Caste, Popular Struggles and Movements, Political Parties, Outcomes of Democracy.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?jess2=0-8'),
      ('NCERT Hindi Kshitij Class 10', 'ebook', 'PDF', NULL, 'NCERT Hindi Kshitij textbook for Class 10 - Collection of Hindi literature including poetry and prose by renowned Hindi authors.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?jhhn1=0-17'),
      ('NCERT Computer Science Class 11', 'ebook', 'PDF', NULL, 'NCERT Computer Science textbook for Class 11 - Computer System Organization, Computational Thinking and Programming, Introduction to Python, Data Handling, and Society Law and Ethics.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?kecs1=0-12'),
      ('NCERT Computer Science Class 12', 'ebook', 'PDF', NULL, 'NCERT Computer Science textbook for Class 12 - Computational Thinking and Programming-2, Computer Networks, Database Management, Boolean Logic, and Society Law and Ethics - Cyber Safety.', 1, 1, 'Digital Library', 'https://ncert.nic.in/textbook.php?lecs1=0-13')
      ON CONFLICT (title) DO NOTHING
    `);

    // Verify the ebooks were added
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM media 
      WHERE type = 'ebook' AND title LIKE 'NCERT%'
    `);

    console.log(`✅ Migration completed successfully!`);
    console.log(`   Total NCERT ebooks in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function down() {
  console.log('Removing NCERT ebooks from media table...');
  
  try {
    await query(`
      DELETE FROM media 
      WHERE type = 'ebook' AND title LIKE 'NCERT%'
    `);

    console.log('✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

// Run migration
async function run() {
  try {
    console.log('Starting migration: Add NCERT Ebooks');
    console.log('=====================================\n');
    
    await up();
    
    console.log('\n=====================================');
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('\nMigration failed with error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Only run if called directly
if (require.main === module) {
  run();
}

module.exports = { up, down };
