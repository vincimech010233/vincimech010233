# Library Lending Analytics (SQL)

A compact SQLite project showing relational schema design, constraints, joins, grouping, and useful reports. All names and records are fictional.

Run with Python's built-in SQLite module (no sqlite3 shell required):

```bash
python3 run_reports.py
```
The script creates an in-memory database, loads `schema.sql` and `seed.sql`, then prints the overdue list and most borrowed books.

Skills: SQL, relational modeling, foreign keys, aggregate queries, reproducible fixtures.
