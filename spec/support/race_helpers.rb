# spec/support/race_helpers.rb
module RaceHelpers
  def build_race_with_lanes(*students, name:, status: :draft)
    build(:race, name: name, status: status).tap do |race|
      students.each_with_index do |student, idx|
        race.lane_assignments.build(student: student, lane_number: idx + 1)
      end
    end
  end

  def add_results(race, places_by_student)
    places_by_student.each do |student, place|
      race.race_results.build(student: student, place: place)
    end
  end
end
