import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { MyService } from '../services/myService.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isValidCustomSuit } from '../validators/custom-suit.validator';

@Component({
  selector: 'app-plan-poker',
  templateUrl: './plan-poker.component.html',
  styleUrl: './plan-poker.component.scss',
})
export class PlanPokerComponent {
  connected = false;
  suits = [
    {
      name: 'Default',
      cards: '1;2;3;5;8;13;21;34;50;?'
    },
    {
      name: 'Simple',
      cards: '1;2;3;4;5;6;7;8;9;?',
    },
    {
      name: 'Jumbo',
      cards: '10;20;50;100;200;500;?',
    },
    {
      name: 'T-shirt Sizing',
      cards: 'XS;S;M;L;XL;XXL;?',
    },
  ];
  data: any = {};
  vote = '';
  userId = null;
  roomId = null;

  identityForm = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    roomName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    suit: new FormControl(this.suits[0].cards),
    customSuit: new FormControl(this.suits[0].cards, [isValidCustomSuit(";")])
  });
  
  optionForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(5)]),
    description: new FormControl(''),
    url: new FormControl(''),
  });
  
  openSidenav = false;
  sub: any;
  dialogRef: any;
  snackBarRef: any; 
  
  constructor(
    private http: HttpClient,
    private myService: MyService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private _snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id && id.toString().length > 0) {
      this.myService.getRoom(id).subscribe((data) => {
        if (data.body.room) {
          this.roomId = data.body.room.id;
          this.identityForm.setValue({
            userName: '',
            roomName: data.body.room.name,
            suit: '',
            customSuit:null
          });
          this.identityForm.get('roomName')?.disable();
        }
      });
    }
    this.identityForm.get('suit')?.valueChanges.subscribe(selectedValue => {
      if(selectedValue!=='custom'){
        this.identityForm.get('customSuit')?.setValue(null);
      }
    });
  }

  submit() {
    if (this.identityForm.value.userName) {
      const suit = this.identityForm.value.suit && this.identityForm.value.suit!= 'custom' 
        ? this.identityForm.value.suit
        : this.identityForm.value.customSuit ?? '';
      this.myService
        .login(
          this.identityForm.value.roomName ?? '',
          this.identityForm.value.userName,
          suit,
          this.roomId
        )
        .subscribe((data: any) => {
          this.roomId = data.room.id;
          this.userId = data.userId;
          this.myService
            .getServerSentEvent(
              environment.apiUrl + '/events/' + this.roomId + '/' + this.userId
            )
            .subscribe((event) => {
              this.connected = true;
              (this.data = JSON.parse(event.data)), null, 2;
              this.optionForm.setValue({
                name: this.data.name,
                description: this.data.description,
                url: this.data.url,
              });
              if (this.data.status === 0) {
                this.vote = '';
              }
            });
        });
    }
  }

  passer() {
    if (this.roomId) {
      this.myService.passer(this.roomId).subscribe();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  openDialog(templateRef: TemplateRef<unknown>) {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '75%',
      ariaLabel: 'Room configuration modal',
    });
  }

  updateSalle() {
    if (this.roomId && this.optionForm.valid) {
      this.myService
        .update(this.roomId, {
          name: this.optionForm.value.name,
          description: this.optionForm.value.description,
          url: this.optionForm.value.url,
        })
        .subscribe(() => {
          this.dialogRef.close();
        });
    }
  }

  onVoted(value: string) {
    if (this.roomId && this.userId) {
      this.vote = value;
      this.myService.voter(this.roomId, this.userId, value).subscribe();
    }
  }

  share(templateRef: TemplateRef<any>) {
    if (this.roomId) {
      const url = window.location.origin + '/' + this.roomId;
      navigator.clipboard.writeText(url).then(
        () => {
          this._snackbar.open('Link saved in the clipboard', 'Fermer', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 3000,
          });
        },
        () => {
          this._snackbar.open(
            'Error happend while saving in the clipboard',
            'Fermer',
            {
              horizontalPosition: 'center',
              verticalPosition: 'top',
              duration: 3000,
            }
          );
        }
      );
    }
  }
}
