require "rails_helper"

RSpec.describe RaceResult, type: :model do
  let(:s1) { create(:student) }
  let(:s2) { create(:student) }

  let(:race) do
    build_race_with_lanes(s1, s2, name: "Heat 1", status: :draft).tap(&:save!)
  end

  describe "validations" do
    context "when place is missing" do
      it "requires place" do
        race_result = build(:race_result, race: race, student: s1, place: nil)

        expect(race_result).not_to be_valid
        expect(race_result.errors[:place]).to include("can't be blank")
      end
    end

    describe "student uniqueness per race" do
      before do
        # Creates an existing result for this race/student
        add_results(race, { s1 => 1 })
        race.save! # Persists the race_result because auto save is enabled
      end

      it "does not allow the same student to have multiple results for the same race" do
        duplicate = build(:race_result, race: race, student: s1, place: 2)

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:student_id]).to include("has already been taken")
      end

      it "allows the same student to have results for different races" do
        other_race =
          build_race_with_lanes(s1, s2, name: "Heat 2", status: :draft).tap(&:save!)

        race_result = build(:race_result, race: other_race, student: s1, place: 1)
        expect(race_result).to be_valid
      end
    end
  end
end
