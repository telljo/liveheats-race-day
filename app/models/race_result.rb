class RaceResult < ApplicationRecord
  belongs_to :race
  belongs_to :student
  validates :place, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :student_id, uniqueness: { scope: :race_id }
end
