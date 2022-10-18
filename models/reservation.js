/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** Setter for numGuests with validation */
  get numGuests(){
    return this._numGuests;
  }

  set numGuests(val){
    if(val<1) {
      const err = new Error("Invalid request. Must have 1 or more guest(s).");
      err.status = 400;
      throw err;
    }
    this._numGuests = val;
  }

  get notes(){
    return this._notes;
  };

  set notes(val){
    if(!val) val = " ";
    this._notes = val;
  }

  get startAt(){
    return this._startAt;
  };

  set startAt(val){
    console.log(val,"Error")
    if(val instanceof(Date)) this._startAt = val;;
    throw Error("Valid date must be provided.")
  };

  get customerId(){
    return this._customerId;
  };

  set customerId(val){
    if(val != this._customerId && this._customerId){
      const err = new Error("Cannot change the customer.");
      err.status = 400;
      throw err
    };
    this._customerId = val;
  };

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save(){
    const results = await db.query(
      `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
    )
    console.log(results)
    if(results.rows.rowCount<=0) {
      const err = new Error("Unable to create a reservation");
      err.status = 400;
      throw err
    }
  };
}


module.exports = Reservation;
