# frozen_string_literal: true

module Borrowings
  class ReturnService
    # Small but worth isolating - return rules may grow (fees, reminders, etc.)
    Result = Struct.new(:success?, :borrowing, :errors, keyword_init: true)

    def initialize(borrowing:)
      @borrowing = borrowing
    end

    def call
      return failure("Loan is already returned") unless borrowing.active?

      borrowing.update!(returned_at: Time.current)
      Result.new(success?: true, borrowing: borrowing, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      failure(e.record.errors.full_messages)
    end

    private

    attr_reader :borrowing

    def failure(messages)
      Result.new(success?: false, borrowing: borrowing, errors: Array(messages))
    end
  end
end
