from pathlib import Path
import sqlite3
base=Path(__file__).parent
db=sqlite3.connect(':memory:'); db.executescript((base/'schema.sql').read_text()); db.executescript((base/'seed.sql').read_text())
print('Open loans past due date (as of 2026-01-21):')
for row in db.execute("SELECT m.name,b.title,l.due_date FROM loans l JOIN members m USING(member_id) JOIN books b USING(book_id) WHERE l.returned_date IS NULL AND l.due_date < '2026-01-21' ORDER BY l.due_date"):
 print(' | '.join(row))
print('\nMost borrowed books:')
for title,count in db.execute('SELECT b.title,COUNT(*) AS loans FROM loans l JOIN books b USING(book_id) GROUP BY b.book_id ORDER BY loans DESC,b.title'):
 print(f'{title}: {count}')
