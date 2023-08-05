import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CustomerService} from "../services/customer.service";
import {catchError, map, Observable, throwError} from "rxjs";
import {CustomerModel} from "../model/customer.model";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  customers! : Observable<Array<CustomerModel>>;
  errorMessage! : String;
  searchFormGroup : FormGroup | undefined;

  constructor(private customerService : CustomerService, private fb : FormBuilder) {}

  ngOnInit(): void {
   /* this.customerService.getCustomers().subscribe({
      next : (data) => {
        this.customers = data;
      },
      error : (err) => {
        this.errorMessage = err.message;
        console.log(err);
      }
    }); */


    //Création d'un formGroup pour le formulaire (initialiser le formulaire)
    this.searchFormGroup = this.fb.group({
      keyword : this.fb.control("")
    });

    this.handleSearchCustomers();

  }


  handleSearchCustomers() {
    let kw = this.searchFormGroup?.value.keyword;  // ? : ca signifie si la valeur existe
    this.customers = this.customerService.searchCustomers(kw).pipe(
      catchError(err=>{
        this.errorMessage = err.message;
        return throwError(err);
      })
    );

  }

  handleDeleteCustomer(c: CustomerModel) {
    let conf = confirm("Are you sure?");
    if(!conf) return; // s'il clique sur annuler on procède pas à la suppression
    this.customerService.deleteCustomer(c.id).subscribe({
      next : (resp)=> {
        this.customers = this.customers.pipe(
          map(data=>{
            //Supprimer seulement objet pour ne plus recharger tout la page (supprimer une partie du tableau)
            let index = data.indexOf(c);
            data.slice(index, 1)
            return data;
          })
        );
      },
      error : err => {
        console.log(err);
      }
    })
  }
}
