# Demo users and sample catalog for reviewers.
# Password for everyone: password123

librarian = User.find_or_create_by!(email: "librarian@library.test") do |user|
  user.name = "Laura Librarian"
  user.password = "password123"
  user.password_confirmation = "password123"
  user.role = :librarian
end

member = User.find_or_create_by!(email: "member@library.test") do |user|
  user.name = "Pablo Member"
  user.password = "password123"
  user.password_confirmation = "password123"
  user.role = :member
end

books = [
  { title: "The Pragmatic Programmer", author: "Hunt & Thomas", genre: "Software", isbn: "9780201616224", total_copies: 3 },
  { title: "Clean Architecture", author: "Robert C. Martin", genre: "Software", isbn: "9780134494166", total_copies: 2 },
  { title: "Domain-Driven Design", author: "Eric Evans", genre: "Software", isbn: "9780321125217", total_copies: 1 },
  { title: "One Hundred Years of Solitude", author: "Gabriel Garcia Marquez", genre: "Fiction", isbn: "9780060883287", total_copies: 4 }
]

books.each do |attrs|
  Book.find_or_create_by!(isbn: attrs[:isbn]) do |book|
    book.assign_attributes(attrs)
  end
end

ddd = Book.find_by!(isbn: "9780321125217")
Borrowing.find_or_create_by!(user: member, book: ddd, returned_at: nil) do |loan|
  loan.borrowed_at = 10.days.ago
  loan.due_at = 4.days.from_now
end

overdue_book = Book.find_by!(isbn: "9780134494166")
Borrowing.find_or_create_by!(user: member, book: overdue_book, returned_at: nil) do |loan|
  loan.borrowed_at = 20.days.ago
  loan.due_at = 6.days.ago
end

puts "Seeded librarian: #{librarian.email}"
puts "Seeded member: #{member.email}"
puts "Password for both: password123"
