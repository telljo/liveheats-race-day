require "rails_helper"

RSpec.describe Race, type: :model do
  let(:race) { create(:race, status: :draft) }

  let(:s1) { create(:student) }
  let(:s2) { create(:student) }
  let(:s3) { create(:student) }

  def assign_lanes(*students)
    students.each_with_index do |student, idx|
      create(:lane_assignment, race:, student:, lane_number: idx + 1)
    end
  end

  def add_results(places_by_student)
    places_by_student.each do |student, place|
      create(:race_result, race:, student:, place:)
    end
  end

  describe "validations" do
    context "when completed" do
      it "requires at least MIN_STUDENTS lane assignments" do
        create(:lane_assignment, race:, student: s1, lane_number: 1)

        race.status = :completed

        expect(race).not_to be_valid
        expect(race.errors[:lane_assignments]).to include(
          "At least #{Race::MIN_STUDENTS} students are required."
        )
      end

      it "allows ties with valid competition ranking" do
        assign_lanes(s1, s2, s3)
        add_results(s1 => 1, s2 => 1, s3 => 3)

        race.status = :completed
        expect(race).to be_valid
      end

      it "rejects invalid competition ranking" do
        assign_lanes(s1, s2, s3)
        add_results(s1 => 1, s2 => 1, s3 => 2) # should be 3

        race.status = :completed

        expect(race).not_to be_valid
        expect(race.errors[:race_results]).to include(
          "Places must follow competition ranking (e.g. 1,1,3 or 1,2,2,4)."
        )
      end
    end

    context "when draft" do
      it "does not enforce ranking yet" do
        assign_lanes(s1, s2, s3)
        add_results(s1 => 1, s2 => 1, s3 => 2) # invalid ranking

        expect(race).to be_valid
      end
    end
  end
end
