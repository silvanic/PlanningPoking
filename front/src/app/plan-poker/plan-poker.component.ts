import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { MyService } from '../services/myService.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-plan-poker',
  templateUrl: './plan-poker.component.html',
  styleUrl: './plan-poker.component.scss'
})
export class PlanPokerComponent {

  title = 'SSE';
  connected: boolean = false;
  data: any = {};
  identityForm = new FormGroup({
    userName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    roomName: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  optionForm = new FormGroup({
    description: new FormControl(''),
    url: new FormControl('', [Validators.required, Validators.minLength(1)])
  });
  
  userId = null;
  roomId = null;
  sub: any;
  dialogRef: any;
  snackBarRef: any;
  
  constructor(private http: HttpClient, 
    private myService: MyService, 
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackbar: MatSnackBar
  ){}
  
  ngOnInit(){
    const id = this.route.snapshot.params['id'];
    if(id && id.toString().length>0){
      this.myService.getRoom(id).subscribe(data=>{
        if(data.body.room){
          console.log(data.body.room.name);
          this.roomId = data.body.room.id;          
          this.identityForm.setValue({
            userName: '',
            roomName: data.body.room.name
          });
          this.identityForm.get('roomName')?.disable();
        }
        console.log('resultat : ',data.body);
      });
    }
  } 

  submit() {
    console.log(this.identityForm.value);
    if(this.identityForm.value.userName){
      this.myService.login(
        this.identityForm.value.roomName??'', 
        this.identityForm.value.userName, 
        this.roomId
        ).subscribe((data: any) => {      
          console.log('ok');
          this.roomId = data.room.id;
          this.userId = data.userId;
          this.optionForm.setValue({
            description: data.room.description,
            url: data.room.url
          })
          this.myService.getServerSentEvent(environment.apiUrl+'/events/'+this.roomId+'/'+this.userId)
          .subscribe( event => {
            this.connected = true;
            this.data = JSON.parse(event.data.slice(5)),null,2;
          });
        });
      }
    }

  passer(){
    if(this.roomId){
      this.myService.passer(this.roomId).subscribe();
    }
  }
  
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  
  goToLink(url: string){
    window.open(url,"_blank");
  }
  
  openDialog(templateRef: TemplateRef<unknown>) {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '75%',
      ariaLabel: 'Room configuration modal'
    });
  }
  
  updateSalle(){
    if(this.roomId && this.optionForm.valid){
      this.myService.update(this.roomId, {
        description : this.optionForm.value.description,
        url: this.optionForm.value.url
      }).subscribe(()=>{
        this.dialogRef.close();
      });
    }
  }

  onVoted(value: string){
    if(this.roomId && this.userId){
      this.myService.voter(this.roomId, this.userId, value).subscribe();
    }
  }

  share(templateRef: TemplateRef<any>) {
    if(this.roomId){
      const url = window.location.origin+'/'+this.roomId;
      navigator.clipboard.writeText(url).then(
        ()=> {
          console.log("réussi")
          this._snackbar.open('Lien enregistré dans le presse papier', 'Fermer',{
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 3000
          });
        },
        () => {
          console.log("non")
        }
      )
    }
  }
}
