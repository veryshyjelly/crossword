package types

type Crossword struct {
	Id        string  `db:"xdid" json:"id"`
	Date      string  `db:"date" json:"date"`
	Size      string  `db:"size" json:"size"`
	Title     string  `db:"title" json:"title"`
	Author    *string `db:"author" json:"author,omitempty"`
	Editor    *string `db:"editor" json:"editor,omitempty"`
	Copyright *string `db:"copyright" json:"copyright,omitempty"`
	Publisher string  `db:"publisher" json:"publisher"`
	Puzzle    string  `db:"puzzle" json:"puzzle"`
}
