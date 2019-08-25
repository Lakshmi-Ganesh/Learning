import { Headers } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';

export const REQUEST_HEADER = {
  headers: new Headers({
      'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'
      , 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT'
      , 'Access-Control-Expose-Headers': 'jsontoken'
  })
};

export const HEADER: HttpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
    .set('Access-Control-Expose-Headers', 'jsontoken');
