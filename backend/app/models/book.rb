class Book < ApplicationRecord
  has_many :borrowings, dependent: :destroy

  validates :title, :author, :genre, :isbn, presence: true
  validates :isbn, uniqueness: { case_sensitive: false }
  validates :total_copies, numericality: { only_integer: true, greater_than: 0 }

  before_validation :normalize_isbn

  scope :search, ->(query) {
    return all if query.blank?

    term = "%#{sanitize_sql_like(query.strip)}%"
    # ILIKE is postgres-specific; fine here because the exercise runs on pg
    where("title ILIKE :t OR author ILIKE :t OR genre ILIKE :t", t: term)
  }

  # Derived field - I prefer recalculating over syncing a counter column
  def active_borrowings_count
    borrowings.active.count
  end

  def available_copies
    total_copies - active_borrowings_count
  end

  def available?
    available_copies.positive?
  end

  def as_json(options = {})
    super(options).merge(
      "available_copies" => available_copies,
      "available" => available?
    )
  end

  private

  def normalize_isbn
    self.isbn = isbn.to_s.strip.upcase
  end
end
