# frozen_string_literal: true

module Dashboards
  class LibrarianSummary
    def self.call
      {
        total_books: Book.count,
        total_borrowed: Borrowing.active.count,
        due_today: Borrowing.due_today.includes(:user, :book).map { |b| serialize(b) },
        overdue_members: overdue_members_payload
      }
    end

    def self.serialize(borrowing)
      {
        id: borrowing.id,
        due_at: borrowing.due_at,
        user: borrowing.user.as_json,
        book: borrowing.book.as_json
      }
    end

    def self.overdue_members_payload
      Borrowing.overdue
               .includes(:user, :book)
               .group_by(&:user_id)
               .map do |_user_id, loans|
        user = loans.first.user
        {
          user: user.as_json,
          overdue_books: loans.map { |loan| loan.book.as_json },
          overdue_count: loans.size
        }
      end
    end
  end
end
