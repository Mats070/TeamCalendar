//Globale Variabeln
let nav = 0;
let View = "Month";
let clickedEventDiv = false;

//DOM-Elemente
let CalendarDOM;
let calendar;
let weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let DateDisplay; 

//Events
let events = [];

function loadMonthView(){
    //Monats Ansicht des Kalendars
    calendar.innerHTML = "";

    //Neues Date
    const dt = new Date();

    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
      }

      const currentday = dt.getDate();
      const month = dt.getMonth();
      const year = dt.getFullYear();

      //console.log(day + "  " + month + "  "+year)

      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInFormerMonth = new Date(year, month , 0).getDate();
      
      //console.log(firstDayOfMonth + "       " + daysInMonth)

      //Padding Days
      const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      // => z.B.: Monday, 8/1/2022 (1.8.2022)
      const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);
      //=> schaut an welcher Stelle des Arrays weekdays sich der Name des ersten Tages befindet (z.B. Mittwoch = 2 Paddingdays)

      //Monat im Kalender anzeigen
      DateDisplay.innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;



      //Tage rendern und gerenderte Tage mitzählen
      let SquareCounter = 0;
      for(let i = 1; i <= paddingDays + daysInMonth; i++) {
          //Lokale Datums-Variablen
          let day;
          let SquareMonth; 
          let SquareYear;
          let dayFormated;
          let monthFormated

          //rendern von Padding Days und normalen Days
          const daySquare = document.createElement('div');
          daySquare.classList.add('day');
          

          if (i - paddingDays === currentday && nav === 0) {
            daySquare.id = 'currentDay';
          }

          if (i <= paddingDays){
              daySquare.classList.add("padding-day");
              const MinusValue = i - paddingDays;
              day = daysInFormerMonth + MinusValue;
              SquareMonth = month -1;
              //schauen ob ein Jahreswechsel stattfindet
              if (SquareMonth == -1){
                  SquareMonth=11;
                  SquareYear= year-1;
              }else{
                  SquareYear = year;
              }

              daySquare.innerHTML = '<div class="dayHeaderInfos"><span>'+day+'</span></span>';
          }else{
              day = i - paddingDays;
              SquareMonth = month;
              SquareYear = year;
              daySquare.innerHTML = '<div class="dayHeaderInfos"><span>'+day+'</span></span>';
          }

          //Event div hinzufügen
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('Events');
          eventDiv.addEventListener('click', function(){
              clickedEventDiv = true;
              alert('Show all Events')
          })
          daySquare.appendChild(eventDiv);


          //Date Variablen Formatieren
          if(SquareMonth < 9){
              monthFormated = "0"+(month+1)
          }else{
              monthFormated = month +1
          }

          if (day < 10){
              dayFormated = "0"+day;
          }else{
              dayFormated = day;
          }

          //Events suchen, die an dem Tag liegen
          const formatedDate =SquareYear+"/"+monthFormated+"/"+dayFormated
          const todaysEvents = searchEventsforDay(formatedDate);

          //5 event divs rendern
          for (let eventnumber=1; eventnumber<=5; eventnumber++){
              const event = document.createElement('div');
              event.classList.add("event");
              event.setAttribute("data-event-number", eventnumber)

              eventDiv.appendChild(event)
          }

          //Click Event hinzufügen
          daySquare.addEventListener("click", function(){
            if (!clickedEventDiv){
                alert("Day Clicked: "+ SquareYear +  "/" +(SquareMonth+1) + "/" + day)
            }
        })
          daySquare.setAttribute("data-date", formatedDate);
          calendar.appendChild(daySquare);
          SquareCounter++;
      }

      if (SquareCounter < 42){
          const renderDays = 42 - SquareCounter;
          for (i=1; i<renderDays +1; i++){
              let SquareMonth;
              let SquareYear;
              let day = i;

              //Variablen deklarieren
              if (month <= 10){
                  SquareMonth = month + 2;
                  SquareYear = year;
              }else{
                  SquareMonth = 1;
                  SquareYear = year + 1;
              }


            //Padding Days rendern
            const formatedDate =SquareYear+"/"+SquareMonth+"/"+day
            const daySquare = document.createElement('div');
            daySquare.classList.add('day');
            daySquare.classList.add("padding-day");
            daySquare.innerHTML = '<div class="dayHeaderInfos"><span>'+day+'</span></span>';
            daySquare.addEventListener("click", function(){
                alert("Day Clicked: " + SquareYear+"/"+SquareMonth+"/"+day)
            });
            daySquare.setAttribute("data-date", formatedDate);

            //Event div hinzufügen
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('Events');
            eventDiv.addEventListener('click', function(){
              clickedEventDiv = true;
              alert('Show all Events')
            })
            daySquare.appendChild(eventDiv);

            //5 event divs rendern
            for (let eventnumber=1; eventnumber<=5; eventnumber++){
               const event = document.createElement('div');
               event.classList.add("event");
               event.setAttribute("data-event-number", eventnumber)

               eventDiv.appendChild(event)
            }


            calendar.appendChild(daySquare);
        }
      }
      renderEventsMonth();
} 

function today(){
    //Aktuelles Datum rendern
    nav = 0;
    init();
}

function back(){
    //Eine Zeiteinheit zurück
    nav--;
    init();
}

function next(){
    //Eine Zeiteinheit vor
    nav++;
    init();
}

function init(){
    //Kalendar rendern und Buttons aktivieren
    loadMonthView();
    document.getElementById("backBtn").addEventListener("click", back);
    document.getElementById("nextBtn").addEventListener("click", next);
    document.getElementById("todayBtn").addEventListener("click", today)
};

function searchEventsforDay(day){
    const eventsForDay = events.filter(e => e.days.includes(day))
    return eventsForDay;
}

function renderEventsMonth(){
    const DayList = document.querySelectorAll(".day");
    DayList.forEach(e => {
        //Vorgefertigte EventSlots und das aktuelle Date
        const EventSlots = e.children[1].children
        const actualDate = e.dataset.date;

        //Events, die an dem Tag stattfinden
        const eventsfortheday = searchEventsforDay(actualDate);
    
        if (eventsfortheday.length > 0){
            let TakenPlaces = [];
            //Belegte Event Slots direkt in TakenPlaces hinzufügen
            for (let sl = 0; sl < 5; sl++){
                if (EventSlots[sl].children.length > 0){
                    //Belegt daher in TakenPlaces Array hinzufügen
                    TakenPlaces.push(sl);
                }
            }   


            //Am Tag ist mindestens 1 Event vorhanden
            //Alle MultipleDay-Events rendern
            eventsfortheday.forEach(event => {
                    ////Wenn der aktuelle Tag der Starttag und es sich um ein Mehrtagiges Event handelt ist schauen ob eine Reihe frei ist bzw. eine auswählen
                    if (actualDate == event.startDate && event.days.length > 1){
                       //Rausfinden welche reihe frei ist
                        let Place;
                        for (let slot=0; slot < 5; slot++){
                            if (EventSlots[slot].children.length == 0){
                               Place = slot;
                               break;
                            }
                        }
                        const Slot = EventSlots[Place];
                        TakenPlaces.push(Place);

                        //Neues Element erstellen und in das entsprechende event div einfügen
                        const SlotEvent = document.createElement('div');
                        SlotEvent.innerText = event.title;
                        SlotEvent.style.color = event.textColor;
                        SlotEvent.style.backgroundColor = event.backgroundColor;
                        SlotEvent.style.width = "100%";
                        Slot.appendChild(SlotEvent);

                        //Dauer des Events
                        const Duration = event.days.length;
                        //Für jeden weiteren Tag den selben Plats "reservieren"
                        for (let d=1; d<Duration; d++){
                            const Date = event.days[d];
                            DayList.forEach(day => {
                                const actualDate = day.dataset.date;
                                if (actualDate == Date){
                                    //Neues Element hinzufügen
                                    const DayEventSlots = day.children[1].children
                                    const DaySlot = DayEventSlots[Place];
                                    const DaySlotEvent = document.createElement('div');
                                    DaySlotEvent.innerText = ".";
                                    DaySlotEvent.style.color = event.backgroundColor;
                                    DaySlotEvent.style.backgroundColor = event.backgroundColor;
                                    DaySlotEvent.style.width = "100%";
                                    DaySlot.appendChild(DaySlotEvent);
                                }
                            })
                        }
                }
            })

            //Alle OneDay-AllDay Events rendern
            eventsfortheday.forEach(event => {
                if (event.days.length == 1 && event.alldays.includes(event.startDate)){
                    //=> AllDay Event, welches nicht über mehrere Tage geht
                    let Place;
                    for (let slot=0; slot < 5; slot++){
                        if (EventSlots[slot].children.length == 0){
                            Place = slot;
                            break;
                        }
                    }
                    const Slot = EventSlots[Place];
                    TakenPlaces.push(Place);

                    //Neues Element rendern und hinzufügen
                    const SlotEvent = document.createElement('div');
                    SlotEvent.innerText = event.title;
                    SlotEvent.style.color = event.textColor;
                    SlotEvent.style.backgroundColor = event.backgroundColor;
                    SlotEvent.style.width = "100%";
                    Slot.appendChild(SlotEvent);
                }
            })


            //Alle OneDay Elements rendern, die nicht AllDay sind
            eventsfortheday.forEach(event =>{
                if (event.days.length == 1 && !event.alldays.includes(event.startDate)){
                    //=> Element, was nicht allDay ist und nicht über mehrere Tage geht
                    let Place;
                    for (let slot=0; slot < 5; slot++){
                        if (EventSlots[slot].children.length == 0){
                            Place = slot;
                            break;
                        }
                    }
                    const Slot = EventSlots[Place];
                    TakenPlaces.push(Place);

                    //Neue Elemene rendern und hinzufügen
                    const DisplayBGC = document.createElement("div");
                    DisplayBGC.classList.add("MonthViewShowColor");
                    DisplayBGC.style.backgroundColor = event.backgroundColor;
                    
                    const SlotEvent = document.createElement('span');
                    SlotEvent.innerText = event.title;
                    SlotEvent.style.paddingLeft = "2px";
                    SlotEvent.style.overflowX = 'visible';

                    Slot.appendChild(DisplayBGC);
                    Slot.appendChild(SlotEvent);


                }
            })

            if (TakenPlaces.length >= 5){
                const lastSlot = EventSlots[4];
                lastSlot.innerHTML = "";
                const tooMuch = eventsfortheday.length - 4;
                const El = document.createElement('div');
                El.style.backgroundColor = "lightgrey";
                El.innerText = "View "+tooMuch+" more"
                lastSlot.appendChild(El)
            }
        }
    })
}

function initCalendar(elementID, options){
    //Funktion die von außerhalb gecallt werden kann
    //Kalender Element definieren
    CalendarDOM = document.getElementById(elementID);

    
    
    //header hinzufügen
    const header = document.createElement('div');
    header.id = 'calendar-header';
    header.innerHTML = '<div id="date-display"></div><div id="buttonsection"><button id="todayBtn">Today</button><button id="backBtn">Back</button><button id="nextBtn">Next</button></div>'

    //Weekdays hinzufügen
    const weekdaysDOM = document.createElement('div');
    weekdaysDOM.id = 'weekdays';
    weekdaysDOM.innerHTML = '<div class="weekday">Mon</div><div class="weekday">Tue</div><div class="weekday">Wed</div><div class="weekday">Thu</div><div class="weekday">Fri</div><div class="weekday">Sat</div><div class="weekday">Sun</div>';

    //Leeres Calendar-Main Div erstellen
    const CalendarMain = document.createElement('div');
    CalendarMain.id = 'calendar-main'

    //Leeres Calendar-Footer Div erstellen
    const CalendarFooter = document.createElement('div');
    CalendarFooter.id = 'calendar-footer';
   
    //Options
    if (options){
        events = options.events;
        if (options.startSunday){
            weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            weekdaysDOM.innerHTML = '<div class="weekday">Sun</div><div class="weekday">Mon</div><div class="weekday">Tue</div><div class="weekday">Wed</div><div class="weekday">Thu</div><div class="weekday">Fri</div><div class="weekday">Sat</div>';
        }
    }

    //Elemente hinzufügen
    CalendarDOM.appendChild(header);
    CalendarDOM.appendChild(weekdaysDOM);
    CalendarDOM.appendChild(CalendarMain);
    CalendarDOM.appendChild(CalendarFooter);

    //Globale Variablen initialisieren
    calendar = document.getElementById("calendar-main");
    DateDisplay = document.getElementById("date-display");


    init();
    
}

