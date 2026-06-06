# frozen_string_literal: true

require "rails_helper"

RSpec.describe Borrowing, type: :model do
  it "sets due date two weeks after borrow by default" do
    borrowing = build(:borrowing, borrowed_at: Time.zone.parse("2026-01-01 10:00"), due_at: nil)
    borrowing.valid?
    expect(borrowing.due_at).to be_within(1.second).of(Time.zone.parse("2026-01-15 10:00"))
  end

  it "knows when a loan is overdue" do
    borrowing = build(:borrowing, :overdue)
    expect(borrowing).to be_overdue
  end
end
