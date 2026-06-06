# User story (informal)

**As a** community library member  
**I want to** browse available books, borrow one copy, and see when it is due  
**So that** I can read at home without losing track of return dates.

**As a** librarian  
**I want to** manage the catalog, see overdue loans, and mark returns  
**So that** the shelves stay accurate and members get reminded before things pile up.

## Happy path

1. Member logs in and searches for "Architecture".
2. Member borrows a book with available copies.
3. Member dashboard shows due date and overdue flag if applicable.
4. Librarian logs in, sees totals + overdue members.
5. Librarian marks the book as returned.
6. Book becomes available again for other members.

## Edge cases I explicitly handled

- Member cannot borrow the same title twice while an active loan exists.
- Member cannot borrow when `available_copies` is zero.
- Librarian-only CRUD on books (members get 403, not a silent failure).
- Concurrent borrows on the last copy use a DB row lock in the service layer.
