import { Component, ChangeDetectorRef } from '@angular/core';
import { Entries } from 'src/app/models/Entries';
import { DashboardService } from "../../services/dashboard.service";
import { CustomDatePipe } from "../../services/custom-date.pipe";
// import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  entries: any = []
  regex =  /^\d+$/;

  entry: Entries = {
    status: 0,
    task: '',
    start_time: new Date(),
    end_time: new Date(),
  }
  updateDate: Date = new Date()
  entryCheck: string = '';
  currentEntryId: number = 0 

  constructor(private dashboardService: DashboardService, public customDate: CustomDatePipe, private cdRef: ChangeDetectorRef){}
  ngOnInit(){
    this.getName();
    this.getEntries();
    this.getEntryStatus()
  }
  getTotalHours(start: Date, end: Date){
    const [startformat, endformat] = [new Date(start), new Date(end)]
    const starts = startformat.getTime()
    const ends = endformat.getTime()
    const difference = ends - starts
    const hours = Math.floor(difference / 1000 / 60 / 60)
    const minutes = Math.floor((difference / 1000 / 60 )% 60)
    const seconds = Math.floor((difference/1000)%60)
    return this.padZero(hours) + ':' + this.padZero(minutes) + ':' + this.padZero(seconds)
  }
  padZero(num: number): string{
    return num < 10 ? `0${num}` : `${num}`;
  }
  getEntries(){
    this.dashboardService.getEntries().subscribe(
      (v) => {
        this.entries = v;
      }
    )
  }
  getEntryStatus(){
    this.dashboardService.getEntryCheck().subscribe(
      (res) => {
        const status = res as Array<any>;
        if(status.length > 0){
          this.currentEntryId = status[0].id
          if(status[0].status === 0){
            this.entryCheck = 'started'
          }else{
            this.entryCheck = 'ended'
          }
        }else{
          this.entryCheck = 'no entries'
        }
      }
    )
  }
  addEntry(){
    const data = {
      task: this.entry.task,
      status: this.entry.status
    }
    this.dashboardService.createEntry(data).subscribe(
      (v) => {
        this.getEntries()
        this.getEntryStatus()
        this.entry.task = ''
      }
    )
  }
  endCurrentEntry(){
    this.dashboardService.closeCurrentEntry(this.currentEntryId).subscribe(
      (v) => {
        this.getEntries()
        this.getEntryStatus()
      }
    )
  }
  deleteEntry(id: number){
    this.dashboardService.deleteEntry(id).subscribe(
      (v) => {
        this.getEntries();
        this.getEntryStatus();
      }
    )
  }
  timeFormat(event: any, i: number){
    event.target.value = event.target.value.replace(/:/g, '')
  }
  updateTask(i: number, event: any){
    console.log(this.entries[i], event.target.value)
    this.dashboardService.updateEntry(this.entries[i].id, this.entries[i]).subscribe(
      (v)=>{
        console.log(v)
        this.getEntries();
        // this.getEntryStatus()
      }
    )

  }
  updateStart_time(date: Date, event: any, i: number){
    if(this.regex.test(event.target.value)){
      if(event.target.value.length == 3){
        event.target.value = 0+event.target.value
      }
      const data = {
        start_time: this.getFormatDate(date, event.target.value),
        end_time: this.entries[i].end_time,
        date: this.entries[i].date
      }
      this.dashboardService.updateEntry(this.entries[i].id, data).subscribe(
        (v) => {
          this.getEntries();
        }
      )
    }else{
      this.getEntries();
    }
  }
  getFormatDate(date: any, value: any){
    const seconds = this.customDate.transform(date, 'ss')
    const [newHour, newMinute] = [value.slice(0,2), value.slice(2)]
    const dateformat = this.customDate.transform(date, 'YYYY-MM-DD')
    const [year, month, day] = dateformat.split('-')
    this.updateDate.setFullYear(Number(year), Number(month), Number(day))
    this.updateDate.setHours(Number(newHour), Number(newMinute), Number(seconds))
    return this.updateDate;
  }
  updateEnd_time(date: Date, event: any, i: number){
    if(this.regex.test(event.target.value)){
      if(event.target.value.length == 3){
        event.target.value = 0+event.target.value
      }
      const data = {
        start_time: this.entries[i].start_time,
        end_time: this.getFormatDate(date, event.target.value),
        date: this.entries[i].date
      }
      this.dashboardService.updateEntry(this.entries[i].id, data).subscribe(
        (v) => {
          this.getEntries();
        }
      )
    }else{
      this.getEntries();
    }
  }
  transform(value: Date){
    return this.customDate.transform(value, 'HH:mm')
  }
  
  public getName(){
    const name = localStorage.getItem('name')
    return name;
  }

  public isToday(date: Date){
    const yesterday = this.customDate.transform(new Date(Date.now() - 24*60*60*1000), 'DD-MM-YYYY')
    const today = this.customDate.transform(new Date, 'DD-MM-YYYY')
    const compareDate = this.customDate.transform(date, 'DD-MM-YYYY')
    if(compareDate === today){
      return 'Today'
    }else if(compareDate === yesterday){
      return 'Yesterday'
    }else{
      return false;
    }
  }

}
