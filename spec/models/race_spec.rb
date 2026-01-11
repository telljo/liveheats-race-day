require "rails_helper"

RSpec.describe Race, type: :model do
  let(:name) { "Test race" }

  let(:s1) { create(:student) }
  let(:s2) { create(:student) }
  let(:s3) { create(:student) }

  describe "validations" do
    context "when name is missing" do
      it "requires name" do
        race = build_race_with_lanes(s1, s2, name: nil)

        expect(race).not_to be_valid
        expect(race.errors[:name]).to include("can't be blank")
      end
    end

    describe "lane assignment validation" do
      it "requires at least MIN_STUDENTS lane assignments (runs for draft + completed)" do
        race = build(:race, name:, status: :draft)
        race.lane_assignments.build(student: s1, lane_number: 1)

        expect(race).not_to be_valid
        expect(race.errors[:lane_assignments]).to include(
          "At least #{Race::MIN_STUDENTS} students are required."
        )
      end
    end

    describe "race result validation (context: :complete)" do
      it "does NOT validate race results in the default context" do
        race = build_race_with_lanes(s1, s2, s3, name: name)
        add_results(race, s1 => 1, s2 => 1, s3 => 2) # invalid ranking

        expect(race).to be_valid
      end

      it "allows ties with valid competition ranking when completing" do
        race = build_race_with_lanes(s1, s2, s3, name: name)
        add_results(race, s1 => 1, s2 => 1, s3 => 3)

        expect { race.complete! }.not_to raise_error
        expect(race).to be_completed
      end

      it "rejects invalid competition ranking when completing" do
        race = build_race_with_lanes(s1, s2, s3, name: name)
        add_results(race, s1 => 1, s2 => 1, s3 => 2) # should be 3

        expect { race.complete! }.to raise_error(ActiveRecord::RecordInvalid)
        expect(race.errors[:race_results]).to include(
          "Places must follow competition ranking (e.g. 1,1,3 or 1,2,2,4)."
        )
      end

      it "can be checked directly via valid?(:complete)" do
        race = build_race_with_lanes(s1, s2, s3, name: name)
        add_results(race, s1 => 1, s2 => 1, s3 => 2) # invalid

        expect(race.valid?(:complete)).to eq(false)
        expect(race.errors[:race_results]).to include(
          "Places must follow competition ranking (e.g. 1,1,3 or 1,2,2,4)."
        )
      end
    end
  end
end
