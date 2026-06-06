# frozen_string_literal: true

module Borrowings
  # Service object: keeps controller thin and makes the borrow rules testable in isolation.
  class CreateService
    Result = Struct.new(:success?, :borrowing, :errors, keyword_init: true)

    def initialize(user:, book:)
      @user = user
      @book = book
    end

    def call
      return failure("Only members can borrow books") unless user.member?
      return failure("Book is not available") unless book.available?

      borrowing = nil

      ActiveRecord::Base.transaction do
        # Row lock avoids two members grabbing the last copy at the same time
        locked_book = Book.lock.find(book.id)

        if user.borrowings.active.exists?(book_id: locked_book.id)
          return failure("You already have an active loan for this book")
        end

        return failure("Book is not available") unless locked_book.available?

        borrowing = user.borrowings.create!(book: locked_book)
      end

      Result.new(success?: true, borrowing: borrowing, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      failure(e.record.errors.full_messages)
    end

    private

    attr_reader :user, :book

    def failure(messages)
      list = Array(messages)
      Result.new(success?: false, borrowing: nil, errors: list)
    end
  end
end
