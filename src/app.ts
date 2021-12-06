import express, { Request, Response } from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();

app.get('/api/characters', (req: Request, res: Response) => {
    const query = 'SELECT * FROM Characters';
    connection.query(query, (err, rows) => {
        if (err) throw err;

        const retVal = {
            data: rows,
            message: '',
        };
        if (rows.length === 0) {
            retVal.message = 'No records found';
        }
        res.send(rows);
    });
});

app.get('/api/characters/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const query = `SELECT * FROM Characters WHERE ID = "${id}" LIMIT 1`;
    connection.query(query, (err, rows) => {
        if (err) throw err;

        const retVal = {
            data: rows.length > 0 ? rows[0] : null,
            message: rows.length === 0 ? 'No Record Found' : '',
        };
        res.send(retVal);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Throne of Glass API is Running! 👍');
});
