package db

import (
	"crossword/types"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

var db *sqlx.DB

func init() {
	if bdb, err := sqlx.Connect("sqlite3", "db/cw_database.db"); err != nil {
		log.Fatalln(err)
	} else {
		db = bdb
	}
}

func GetPublishers() ([]string, error) {
	var res []string
	err := db.Select(&res, `select distinct publisher from crossword;`)
	return res, err
}

func GetDates(publisher string) ([]string, error) {
	var res []string
	err := db.Select(&res, `select distinct date from crossword where publisher=$1;`, publisher)
	return res, err
}

func GetPuzzle(publisher, date string) (types.Crossword, error) {
	var res types.Crossword
	err := db.Get(&res, `select * from crossword where publisher=$1 and date=$2;`, publisher, date)
	return res, err
}
