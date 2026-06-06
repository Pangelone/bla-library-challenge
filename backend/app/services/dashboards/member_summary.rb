# frozen_string_literal: true

module Dashboards
  class MemberSummary
    def self.call(user)
      active = user.borrowings.active.includes(:book).order(due_at: :asc)

      {
        borrowed_books: active.map { |b| serialize(b) },
        overdue_books: active.select(&:overdue?).map { |b| serialize(b) }
      }
    end

    def self.serialize(borrowing)
      {
        id: borrowing.id,
        borrowed_at: borrowing.borrowed_at,
        due_at: borrowing.due_at,
        overdue: borrowing.overdue?,
        book: borrowing.book.as_json
      }
    end
  end
end
