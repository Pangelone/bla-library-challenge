# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    sequence(:email) { |n| "user#{n}@library.test" }
    password { "password123" }
    password_confirmation { "password123" }
    role { :member }

    trait :librarian do
      role { :librarian }
    end
  end

  factory :book do
    title { Faker::Book.title }
    author { Faker::Book.author }
    genre { Faker::Book.genre }
    sequence(:isbn) { |n| "ISBN#{n.to_s.rjust(10, '0')}" }
    total_copies { 3 }
  end

  factory :borrowing do
    user
    book
    borrowed_at { Time.current }
    due_at { 2.weeks.from_now }

    trait :returned do
      returned_at { Time.current }
    end

    trait :overdue do
      borrowed_at { 3.weeks.ago }
      due_at { 1.week.ago }
    end
  end
end
