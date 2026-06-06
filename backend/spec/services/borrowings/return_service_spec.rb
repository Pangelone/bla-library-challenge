# frozen_string_literal: true

require "rails_helper"

RSpec.describe Borrowings::ReturnService do
  it "marks an active loan as returned" do
    loan = create(:borrowing)

    result = described_class.new(borrowing: loan).call

    expect(result.success?).to be(true)
    expect(loan.reload.returned_at).to be_present
  end

  it "fails when loan was already returned" do
    loan = create(:borrowing, :returned)

    result = described_class.new(borrowing: loan).call

    expect(result.success?).to be(false)
    expect(result.errors).to include("Loan is already returned")
  end
end
