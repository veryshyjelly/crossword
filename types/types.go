package types

import "database/sql"

type Crossword struct {
	Id        string         `db:"xdid"`
	Date      sql.NullString `db:"date"`
	Size      sql.NullString `db:"size"`
	Title     sql.NullString `db:"title"`
	Author    sql.NullString `db:"author"`
	Editor    sql.NullString `db:"editor"`
	Copyright sql.NullString `db:"copyright"`
	Publisher string         `db:"publisher"`
	Puzzle    string         `db:"puzzle"`
}
