class LaneAssignment < ApplicationRecord
  belongs_to :race
  belongs_to :student
  validates :lane_number, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :lane_number, uniqueness: { scope: :race_id }
  validates :student_id, uniqueness: { scope: :race_id }
end
