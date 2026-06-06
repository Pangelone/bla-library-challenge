# frozen_string_literal: true

require "rails_helper"

RSpec.describe Borrowings::CreateService do
  it "prevents borrowing when no copies left" do
    book = create(:book, total_copies: 1)
    create(:borrowing, book: book)
    member = create(:user)

    result = described_class.new(user: member, book: book).call

    expect(result.success?).to be(false)
    expect(result.errors).to include("Book is not available")
  end
end
