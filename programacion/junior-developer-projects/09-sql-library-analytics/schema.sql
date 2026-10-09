PRAGMA foreign_keys = ON;
CREATE TABLE members (member_id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE books (book_id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL);
CREATE TABLE loans (loan_id INTEGER PRIMARY KEY, member_id INTEGER NOT NULL REFERENCES members(member_id), book_id INTEGER NOT NULL REFERENCES books(book_id), loan_date TEXT NOT NULL, due_date TEXT NOT NULL, returned_date TEXT);
CREATE INDEX idx_loans_due_date ON loans(due_date);
