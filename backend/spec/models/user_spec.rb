# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with default factory" do
    expect(build(:user)).to be_valid
  end

  it "normalizes email to lowercase" do
    user = create(:user, email: "  Test@MAIL.com ")
    expect(user.email).to eq("test@mail.com")
  end
end
