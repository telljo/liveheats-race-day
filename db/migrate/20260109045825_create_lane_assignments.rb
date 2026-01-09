class CreateLaneAssignments < ActiveRecord::Migration[8.0]
  def change
    create_table :lane_assignments do |t|
      t.references :race, null: false, foreign_key: true
      t.references :student, null: false, foreign_key: true
      t.integer :lane_number, null: false

      t.timestamps
    end

    add_index :lane_assignments, [ :race_id, :lane_number ], unique: true
    add_index :lane_assignments, [ :race_id, :student_id ],  unique: true
  end
end
