const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Überprüfe, ob alle benötigten Umgebungsvariablen gesetzt sind
const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
requiredEnv.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`❌ Fehler: ${envVar} ist nicht in der .env-Datei gesetzt!`);
        process.exit(1);
    }
});

// Erstelle die DB-Verbindung
let db;

const createDBConnection = async () => {
    if (!db) {
        try {
            db = await mysql.createConnection(process.env.MYSQL_URL);
            console.log("✅ Erfolgreich mit der MySQL-Datenbank verbunden");
        } catch (err) {
            console.error("❌ Fehler bei der Verbindung zur MySQL-Datenbank:", err.message);
            process.exit(1);
        }
    }
    return db;
};

// Funktion zum Speichern eines Projekts
const saveProject = async (projectData) => {
    const { title, description, imgUrl, techUsed, githubUrl, liveDemoLink } = projectData;

    console.log("Projekt Daten:", projectData); 

    // MySQL-Query vorbereiten
    const query = `
        INSERT INTO projects (title, description, image_url, tech_used, github_rep_link, live_demo_link)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        const dbConnection = await createDBConnection();  // Hol die globale DB-Verbindung
        const [result] = await dbConnection.execute(query, [title, description, imgUrl, techUsed, githubUrl, liveDemoLink]);

        console.log("✅ Projekt erfolgreich gespeichert, ID:", result.insertId);
        return { success: true, insertId: result.insertId };
    } catch (error) {
        console.error("❌ Fehler beim Speichern des Projekts:", error.message);
        return { success: false, error: error.message };
    }
};

async function getProjects(searchTerm) {
    const dbConnection = await createDBConnection();
    
    if (!dbConnection) {
        console.error("❌ Keine gültige DB-Verbindung");
        return [];
    }

    const query = 'SELECT * FROM projects WHERE title LIKE ?';
    try {
        const [results] = await dbConnection.execute(query, [`%${searchTerm}%`]);
        return results;
    } catch (error) {
        console.error("❌ Fehler bei der Abfrage:", error.message);
        return [];
    }
}

// Projekt aktualisieren
async function updateProject(projectId, updatedProject) {
    const { title, description, imgUrl, techUsed, githubUrl, liveDemoLink } = updatedProject;

    const query = `
        UPDATE projects 
        SET title = ?, description = ?, image_url = ?, tech_used = ?, github_rep_link = ?, live_demo_link = ? 
        WHERE id = ?
    `;
    const values = [title, description, imgUrl, techUsed, githubUrl, liveDemoLink, projectId];

    try {
        const dbConnection = await createDBConnection(); // Hol die globale DB-Verbindung
        const [result] = await dbConnection.execute(query, values);
        return result;
    } catch (error) {
        console.error("❌ Fehler beim Aktualisieren des Projekts:", error.message);
        throw error; // Fehler weitergeben, um ihn im Aufrufer zu behandeln
    }
}

// Projekt löschen
async function deleteProject(projectId) {
    const query = `
        DELETE FROM projects 
        WHERE id = ?
    `;
    
    try {
        const dbConnection = await createDBConnection(); // Hol die globale DB-Verbindung
        const [result] = await dbConnection.execute(query, [projectId]);

        if (result.affectedRows > 0) {
            console.log(`✅ Projekt mit ID ${projectId} erfolgreich gelöscht.`);
            return { success: true };
        } else {
            console.log(`❌ Kein Projekt mit ID ${projectId} gefunden.`);
            return { success: false, message: 'Projekt nicht gefunden.' };
        }
    } catch (error) {
        console.error("❌ Fehler beim Löschen des Projekts:", error.message);
        throw error; // Fehler weitergeben, um ihn im Aufrufer zu behandeln
    }
}


module.exports = { 
    saveProject, 
    updateProject,
    getProjects,
    deleteProject
};