ActiveRecord::Base.logger = nil

puts "Seeding…"

# ---- Students ----
students = [
  { first_name: "Ava",  last_name: "Nguyen" },
  { first_name: "Noah", last_name: "Patel"  },
  { first_name: "Mia",  last_name: "Chen"   },
  { first_name: "Leo",  last_name: "Smith"  },
  { first_name: "Zoe",  last_name: "Brown"  },
  { first_name: "Eli",  last_name: "Taylor" }
].map do |attrs|
  Student.find_or_create_by!(attrs)
end

s1, s2, s3, s4, s5, s6 = students

# ---- Helper to build nested attributes cleanly ----
def lane(lane_number, student)
  { lane_number:, student_id: student.id }
end

def result(place, student)
  { place:, student_id: student.id }
end

# ---- Races ----
race_1 = Race.create!(
  name: "Seed Race 1 (Completed)",
  status: "completed",
  lane_assignments_attributes: [
    lane(1, s1),
    lane(2, s2),
    lane(3, s3),
    lane(4, s4)
  ],
  race_results_attributes: [
    result(1, s2),
    result(2, s4),
    result(3, s1),
    result(4, s3)
  ]
)

race_2 = Race.create!(
  name: "Seed Race 2 (Completed)",
  status: "completed",
  lane_assignments_attributes: [
    lane(1, s5),
    lane(2, s6),
    lane(3, s1),
    lane(4, s3)
  ],
  race_results_attributes: [
    result(1, s1),
    result(2, s5),
    result(3, s3),
    result(4, s6)
  ]
)

race_3 = Race.create!(
  name: "Seed Race 3 (Draft)",
  status: "draft",
  lane_assignments_attributes: [
    lane(1, s2),
    lane(2, s4),
    lane(3, s5),
    lane(4, s6)
  ]
)

puts "Done."
puts "Created races: #{[ race_1.id, race_2.id, race_3.id ].join(', ')}"
puts "Students: #{students.count}"
