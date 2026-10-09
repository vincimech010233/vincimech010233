# Expense Summary (Java)

A Java command-line app that reads a simple CSV and summarizes spending by category. Uses only the JDK. The example data is fictional.

```bash
javac ExpenseSummary.java
java ExpenseSummary data/expenses.csv
java ExpenseSummary data/expenses.csv food
```
The optional second argument filters by category. CSV format: `date,category,amount`. Amounts must be non-negative decimals.

Skills: Java, records/classes, collections, CSV parsing, validation, CLI.
