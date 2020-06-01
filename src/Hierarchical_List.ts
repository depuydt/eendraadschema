class Hierarchical_List {
  data: Array<List_Item>;
  active: Array<Boolean>;
  id: Array<number>;
  length: number;
  curid: number;
  mode: string; //can be "edit" or "move"

  constructor() {
    this.length = 0;
    this.data = new Array<List_Item>();
    this.active = new Array<Boolean>();
    this.id = new Array<number>();
    this.curid = 1;
    this.mode = "edit";
  };

  getOrdinalById(my_id: number) : number {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        return(i);
      }
    }
  }

  addItem(my_item: List_Item) {
    //First set the correct identifyer
    my_item.id = this.curid;
    my_item.parent = 0;
    my_item.indent = 0;

    //Then push the data into the queue
    this.data.push(my_item);
    this.active.push(true);
    this.id.push(this.curid);

    //Adjust length of the queue and future identifyer
    this.curid += 1;
    this.length += 1;
  }

  insertItemBeforeId(my_item: List_Item, my_id: number) {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        //First set the correct identifyer
        my_item.id = this.curid;
        my_item.parent = this.data[i].parent;
        my_item.indent = this.data[i].indent;
        my_item.Parent_Item = this.data[this.getOrdinalById(my_item.parent)];
        my_item.collapsed = false;
        //my_item.updateConsumers(); //Needed to ensure we do not give options in the select-box that parent wouldn't allow

        //Insert the data
        this.data.splice(i,0,my_item);
        this.active.splice(i,0,true);
        this.id.splice(i,0,this.curid);

        //Adjust length of the queue and future identifyer
        this.curid += 1;
        this.length += 1;

        break;
      }
    }
  }

  insertItemAfterId(my_item: List_Item, my_id: number) {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        //First set the correct identifyer
        my_item.id = this.curid;
        my_item.parent = this.data[i].parent;
        my_item.indent = this.data[i].indent;
        my_item.Parent_Item = this.data[this.getOrdinalById(my_item.parent)];
        my_item.collapsed = false;
        //my_item.updateConsumers(); //Needed to ensure we do not give options in the select-box that parent wouldn't allow

        //Insert the data
        this.data.splice(i+1,0,my_item);
        this.active.splice(i+1,0,true);
        this.id.splice(i+1,0,this.curid);

        //Adjust length of the queue and future identifyer
        this.curid += 1;
        this.length += 1;

        return(i+1);
        break;
      }
    }
  }

  insertChildAfterId(my_item: List_Item, my_id: number) {
    var ordinal:number = this.insertItemAfterId(my_item, my_id);

    this.data[ordinal].parent = my_id;
    this.data[ordinal].indent = this.data[ordinal-1].indent+1;
    this.data[ordinal].Parent_Item = this.data[this.getOrdinalById(my_id)];
    //this.data[ordinal].resetKeys();
    //this.data[ordinal].updateConsumers(); //Needed to ensure we do not give options in the select-box that parent wouldn't allow
  }

  MoveUp(my_id: number) {
    //-- First find the ordinal number of the current location and the desired location --
    let currentOrdinal = this.getOrdinalById(my_id);
    let newOrdinal = currentOrdinal;
    let currentparent = this.data[currentOrdinal].parent;
    for (var i = currentOrdinal-1; i>=0; i--) {
      if ( (this.data[i].parent == currentparent) && (this.active[i]) ) {
        newOrdinal = i;
        break; //Leave the for loop
      }
    }
    //Swap both items (we swap data and id, we do not need to swap active as both items are active by construction)
    var swapItem: List_Item = new List_Item();
    swapItem = this.data[currentOrdinal];
    this.data[currentOrdinal] = this.data[newOrdinal];
    this.data[newOrdinal] = swapItem;

    var swapID = this.id[currentOrdinal];
    this.id[currentOrdinal] = this.id[newOrdinal];
    this.id[newOrdinal] = swapID;
  }

  MoveDown(my_id: number) {
    //-- First find the ordinal number of the current location and the desired location --
    let currentOrdinal = this.getOrdinalById(my_id);
    let newOrdinal = currentOrdinal;
    let currentparent = this.data[currentOrdinal].parent;
    for (var i = currentOrdinal+1; i<this.length; i++) {
      if ( (this.data[i].parent == currentparent) && (this.active[i]) ) {
        newOrdinal = i;
        break; //Leave the for loop
      }
    }
    //Swap both items (we swap data and id, we do not need to swap active as both items are active by construction)
    var swapItem: List_Item = new List_Item();
    swapItem = this.data[currentOrdinal];
    this.data[currentOrdinal] = this.data[newOrdinal];
    this.data[newOrdinal] = swapItem;

    var swapID = this.id[currentOrdinal];
    this.id[currentOrdinal] = this.id[newOrdinal];
    this.id[newOrdinal] = swapID;
  }

  deleteById(my_id: number) {
    for (var i = 0; i<this.length; i++) {
      if (this.id[i]==my_id) {
        this.active[i] = false;
        for (var j=0; j<this.length; j++) {
          if (this.data[j].parent==my_id) this.deleteById(this.id[j]);
        }
      }
    }
    //alert("Deleted id: " + my_id);
  }

  toHTML(myParent: number) {
    var output: string = "";
    var numberDrawn: number = 0;

    //-- bovenaan de switch van editeer-mode (teken of verplaats) --
    if (myParent == 0) {
      switch (this.mode) {
        case "edit":
          output+= 'Modus (Invoegen/Verplaatsen) <select id="edit_mode" onchange="HL_editmode()"><option value="edit" selected>Invoegen</option><option value="move">Verplaatsen</option></select><br><br>';
          break;
        case "move":
          output+= 'Modus (Invoegen/verplaatsen) <select id="edit_mode" onchange="HL_editmode()"><option value="edit">Invoegen</option><option value="move" selected>Verplaatsen</option></select>'+
                   '<span style="color:red">&nbsp;Verplaatsen is experimenteel!, feedback welkom via het contact-form. Gebruik de pijlen om de volgorde van elementen te wijzigen. '+
                   'Gebruik het Moeder-veld om een component elders in het schema te hangen.</span><br><br>';
          break;
      }
    }

    //--Teken het volledige schema in HTML--
    for (var i = 0; i<this.length; i++) {
      if (this.active[i] && (this.data[i].parent == myParent)) {
        numberDrawn++;
        if (this.data[i].collapsed) {
          output += '<table class="html_edit_table"><tr><td bgcolor="#8AB2E4" onclick="HLCollapseExpand(' + this.data[i].id + ')" valign= "top">&#x229E;</td><td width="100%">'
        } else {
          output += '<table class="html_edit_table"><tr><td bgcolor="#C0C0C0" onclick="HLCollapseExpand(' + this.data[i].id + ')" valign= "top">&#x229F;</td><td width="100%">'
        }
        switch(myParent) {
          case 0: {
            output += this.data[i].toHTML(structure.mode) + "<br>";
            break; }
          default: {
            output += this.data[i].toHTML(structure.mode,this.data[myParent]) + "<br>";
            break; }
        }
        if (!this.data[i].collapsed) {
          output += this.toHTML(this.id[i]);
        }
        output += "</td></tr></table>"
      }
    }
    if ( (myParent == 0) && (numberDrawn<1) ) {
      output += "<button onclick=\"HLAdd()\">Voeg eerste object toe of kies bovenaan \"opnieuw beginnen\"</button>"; //no need for the add button if we have items
    }
    return(output);
  }

  outputSVGDefs() {
    var output: string = `
    <defs>
    <pattern id="VerticalStripe"
      x="5" y="0" width="5" height="10"
      patternUnits="userSpaceOnUse" >
      <line x1="0" y1="0" x2="0" y2="10" stroke="black" />
    </pattern>
    <g id="ster">
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:black" />
      <line x1="-4.33" y1="-2.5" x2="4.33" y2="2.5" style="stroke:black" />
      <line x1="-4.66" y1="2.5" x2="4.33" y2="-2.5" style="stroke:black" />
    </g>
    <g id="sinus">
      <path d="M0,0 C2,-5 8,-5 10,0 S18,5 20,0" style="stroke:black;fill:none" />
    </g>
    <g id="lamp">
      <line x1="-10.61" y1="-10.61" x2="10.61" y2="10.61" stroke="black" stroke-width="2" />
      <line x1="-10.61" y1="10.61" x2="10.61" y2="-10.61" stroke="black" stroke-width="2" />
    </g>
    <g id="led">
      <line x1="0" y1="-7" x2="0" y2="7" stroke="black" stroke-width="2" />
      <line x1="0" y1="-7" x2="12" y2="0" stroke="black" stroke-width="2" />
      <line x1="0" y1="7" x2="12" y2="0" stroke="black" stroke-width="2" />
      <line x1="12" y1="-7" x2="12" y2="7" stroke="black" stroke-width="2" />
      <line x1="6" y1="-6" x2="7" y2="-11" stroke="black" stroke-width="1" />
      <line x1="7" y1="-11" x2="8.11" y2="-9.34" stroke="black" stroke-width="1" />
      <line x1="7" y1="-11" x2="5.34" y2="-9.9" stroke="black" stroke-width="1" />
      <line x1="9" y1="-6" x2="10" y2="-11" stroke="black" stroke-width="1" />
      <line x1="10" y1="-11" x2="11.11" y2="-9.34" stroke="black" stroke-width="1" />
      <line x1="10" y1="-11" x2="8.34" y2="-9.9" stroke="black" stroke-width="1" />
    </g>
    <g id="spot">
      <path d="M0 0 A10 10 0 0 1 10 -10" stroke="black" fill="white" stroke-width="1" />
      <path d="M0 0 A10 10 0 0 0 10 10" stroke="black" fill="white" stroke-width="1" />
      <circle cx="10" cy="0" r="6" style="stroke:black;fill:white" />
      <line x1="5.76" x2="14.24" y1="-4.24" y2="4.24" stroke="black" stroke-width="1" />
      <line x1="5.76" x2="14.24" y1="4.24" y2="-4.24" stroke="black" stroke-width="1" />
    </g>
    <g id="noodlamp_decentraal">
      <rect x="-10.61" y="-10.61" width="21.22" height="21.22" fill="white" stroke="black" />
      <circle cx="0" cy="0" r="5" style="stroke:black;fill:black" />
      <line x1="-7" y1="-7" x2="7" y2="7" stroke="black" stroke-width="2" />
      <line x1="-7" y1="7" x2="7" y2="-7" stroke="black" stroke-width="2" />
    </g>
    <g id="signalisatielamp">
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
      <line x1="-3" y1="-3" x2="3" y2="3" stroke="black" />
      <line x1="-3" y1="3" x2="3" y2="-3" stroke="black" />
    </g>
    <g id="schakelaar_enkel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_dubbel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="8" y1="-16" x2="13" y2="-13.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_wissel_enkel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_rolluik">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="-20" stroke="black" />
      <line x1="-10" y1="-20" x2="-15" y2="-17.5" stroke="black" />
      <rect x="-8" y="-8" width="16" height="16" fill="white" stroke="black" />
      <text x="0" y="6" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16">S</text>
    </g>
    <g id="schakelaar_enkel_dim">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
      <polygon points="-1,-8 11,-8 11,-15" fill="black" stroke="black" />
    </g>
    <g id="schakelaar_kruis_enkel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="-20" stroke="black" />
      <line x1="-10" y1="-20" x2="-15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="10" y2="20" stroke="black" />
      <line x1="10" y1="20" x2="15" y2="17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_dubbelaansteking">
      <line x1="0" y1="0" x2="-10" y2="-20" stroke="black" />
      <line x1="-10" y1="-20" x2="-15" y2="-17.5" stroke="black" />
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="schakelaar_wissel_dubbel">
      <line x1="0" y1="0" x2="10" y2="-20" stroke="black" />
      <line x1="10" y1="-20" x2="15" y2="-17.5" stroke="black" />
      <line x1="8" y1="-16" x2="13" y2="-13.5" stroke="black" />
      <line x1="0" y1="0" x2="-10" y2="20" stroke="black" />
      <line x1="-10" y1="20" x2="-15" y2="17.5" stroke="black" />
      <line x1="-8" y1="16" x2="-13" y2="13.5" stroke="black" />
      <circle cx="0" cy="0" r="5" fill="white" stroke="black" />
    </g>
    <g id="aansluitpunt">
      <circle cx="5" cy="0" r="5" style="stroke:black;fill:none" />
    </g>
    <g id="aftakdoos">
      <circle cx="15" cy="0" r="15" style="stroke:black;fill:none" />
      <circle cx="15" cy="0" r="7.5" style="stroke:black;fill:black" />
    </g>
    <g id="bewegingsschakelaar">
      <rect x="0" y="-13" width="10" height="26" fill="none" style="stroke:black" />
      <rect x="10" y="-13" width="30" height="26" fill="none" style="stroke:black" />
      <line x1="10" y1="13" x2="40" y2="-13"  stroke="black" />
      <line x1="15" y1="-5" x2="20" y2="-5"  stroke="black" />
      <line x1="20" y1="-10" x2="20" y2="-5"  stroke="black" />
      <line x1="20" y1="-10" x2="25" y2="-10"  stroke="black" />
      <text x="22" y="11" style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="10">PIR</text>
    </g>
    <g id="schemerschakelaar">
      <line x1="0" y1="0" x2="5" y2="0"  stroke="black" />
      <line x1="5" y1="0" x2="35" y2="-10"  stroke="black" />
      <line x1="35" y1="0" x2="40" y2="0"  stroke="black" />
      <use xlink:href="#arrow" x="14" y="-17" transform="rotate(90 14 -17)" />
      <use xlink:href="#arrow" x="18" y="-17" transform="rotate(90 18 -17)" />
    </g>
    <g id="stopcontact">
      <path d="M20 0 A15 15 0 0 1 35 -15" stroke="black" fill="white" stroke-width="2" />
      <path d="M20 0 A15 15 0 0 0 35 15" stroke="black" fill="white" stroke-width="2" />
      <line x1="0" y1="0" x2="20" y2="0" stroke="black" />
    </g>
    <g id="stopcontact_aarding">
      <line x1="20" y1="-15" x2="20" y2="15"  stroke="black" stroke-width="2" />
    </g>
    <g id="stopcontact_kinderveilig">
      <line x1="35" y1="-20" x2="35" y2="-15"  stroke="black" stroke-width="2" />
      <line x1="35" y1="20" x2="35" y2="15"  stroke="black" stroke-width="2" />
    </g>
    <g id="bel">
      <path d="M20 0 A15 15 0 0 1 0 15" stroke="black" fill="none" stroke-width="2" />
      <path d="M20 0 A15 15 0 0 0 0 -15" stroke="black" fill="none" stroke-width="2" />
      <line x1="0" y1="15" x2="0" y2="-15" stroke="black" stroke-width="2" />
    </g>
    <g id="boiler">
      <circle cx="20" cy="0" r="20" style="stroke:black;fill:url(#VerticalStripe)" />
    </g>
    <g id="boiler_accu">
      <circle cx="20" cy="0" r="20" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="15" style="stroke:black;fill:url(#VerticalStripe)" />
    </g>
    <g id="motor">
      <circle cx="20" cy="0" r="20" style="stroke:black;fill:none" />
      <text x="20" y="6" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16">M</text>
    </g>
    <g id="elektriciteitsmeter">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <line x1="0" y1="-6" x2="40" y2="-6" stroke="black" stroke-width="1" />
      <text x="20" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12">kWh</text>
    </g>
    <g id="diepvriezer">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <use xlink:href="#ster" x="10" y="0" />
      <use xlink:href="#ster" x="20" y="0" />
      <use xlink:href="#ster" x="30" y="0" />
    </g>
    <g id="zonnepaneel">
      <rect x="0" y="-12" width="80" height="30" fill="none" style="stroke:black" />
      <line x1="3" y1="3" x2="77" y2="3" stroke="black" />
      <line x1="20" y1="-9" x2="20" y2="15" stroke="black" />
      <line x1="40" y1="-9" x2="40" y2="15" stroke="black" />
      <line x1="60" y1="-9" x2="60" y2="15" stroke="black" />
    </g>
    <g id="drukknop">
      <circle cx="12" cy="0" r="12" style="stroke:black;fill:none" />
      <circle cx="12" cy="0" r="7" style="stroke:black;fill:none" />
    </g>
    <g id="teleruptor">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <line x1="8" y1="6" x2="16" y2="6"  stroke="black" />
      <line x1="24" y1="6" x2="32" y2="6"  stroke="black" />
      <line x1="16" y1="-6" x2="16" y2="6"  stroke="black" />
      <line x1="24" y1="-6" x2="24" y2="6"  stroke="black" />
    </g>
    <g id="dimmer">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <line x1="10" y1="5" x2="30" y2="6"  stroke="black" />
      <line x1="10" y1="5" x2="10" y2="-5"  stroke="black" />
      <line x1="10" y1="-5" x2="30" y2="5"  stroke="black" />
    </g>
    <g id="relais">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <line x1="10" y1="-13" x2="30" y2="13"  stroke="black" />
    </g>
    <g id="minuterie">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <text x="20" y="6" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="16">t</text>
    </g>
    <g id="thermostaat">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <circle cx="20" cy="0" r="8" style="stroke:black;fill:none" />
      <line x1="12" y1="0" x2="28" y2="0"  stroke="black" />
    </g>
    <g id="tijdschakelaar">
      <rect x="0" y="-13" width="40" height="26" fill="none" style="stroke:black" />
      <circle cx="11" cy="0" r="8" style="stroke:black;fill:none" />
      <line x1="10" y1="0"  x2="17" y2="0"  stroke="black" />
      <line x1="11" y1="-6" x2="11" y2="1"  stroke="black" />
      <line x1="21" y1="0"  x2="25" y2="0"  stroke="black" />
      <line x1="25" y1="0"  x2="31" y2="-5"  stroke="black" />
      <line x1="31" y1="0"  x2="36" y2="0"  stroke="black" />
    </g>
    <g id="droogkast">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <circle cx="15" cy="-7.5" r="5" style="stroke:black;fill:none" />
      <circle cx="25" cy="-7.5" r="5" style="stroke:black;fill:none" />
      <circle cx="20" cy="7.5" r="3" style="stroke:black;fill:black" />
    </g>
    <g id="omvormer">
      <rect x="0" y="-15" width="60" height="30" fill="none" style="stroke:black" />
      <line x1="35" y1="-12" x2="25" y2="12" stroke="black" />
      <text x="15" y="-1" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">AC</text>
      <text x="45" y="10" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="12">DC</text>
    </g>
    <g id="koelkast">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <use xlink:href="#ster" x="20" y="0" />"
    </g>
    <g id="kookfornuis">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <circle cx="10" cy="10" r="3" style="stroke:black;fill:black" />
      <circle cx="30" cy="10" r="3" style="stroke:black;fill:black" />
      <circle cx="30" cy="-10" r="3" style="stroke:black;fill:black" />
    </g>
    <g id="microgolf">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <use xlink:href="#sinus" x="10" y="-10" />"
      <use xlink:href="#sinus" x="10" y="0" />"
      <use xlink:href="#sinus" x="10" y="10" />"
    </g>
    <g id="oven">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <line x1="0" y1="-5" x2="40" y2="-5" stroke="black" />
      <circle cx="20" cy="7.5" r="3" style="stroke:black;fill:black" />
    </g>
    <g id="vaatwasmachine">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <line x1="0" y1="-20" x2="40" y2="20" style="stroke:black;fill:none" />
      <line x1="40" y1="-20" x2="0" y2="20" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="8" style="stroke:black;fill:white" />
    </g>
    <g id="ventilator">
      <rect x="0" y="-15" width="30" height="30" fill="none" style="stroke:black" />
      <circle cx="10" cy="0" r="5" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="5" style="stroke:black;fill:none" />
    </g>
    <g id="transformator">
      <circle cx="8" cy="0" r="8" style="stroke:black;fill:none" />
      <circle cx="20" cy="0" r="8" style="stroke:black;fill:none" />
    </g>
    <g id="verwarmingstoestel">
      <rect x="0" y="-15" width="50" height="30" fill="url(#VerticalStripe)" style="stroke:black" />
    </g>
    <g id="verwarmingstoestel_accu">
      <rect x="0" y="-15" width="50" height="30" fill="none" style="stroke:black" />
      <rect x="5" y="-10" width="40" height="20" fill="url(#VerticalStripe)" style="stroke:black" />
    </g>
    <g id="verwarmingstoestel_accu_ventilator">
      <rect x="0" y="-15" width="70" height="30" fill="none" style="stroke:black" />
      <rect x="5" y="-10" width="35" height="20" fill="url(#VerticalStripe)" style="stroke:black" />
      <circle cx="50" cy="0" r="5" style="stroke:black;fill:none" />
      <circle cx="60" cy="0" r="5" style="stroke:black;fill:none" />
    </g>
    <g id="verbruiker">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
    </g>
    <g id="wasmachine">
      <rect x="0" y="-20" width="40" height="40" fill="none" style="stroke:black" />
      <circle cx="20" cy="0" r="3" style="stroke:black;fill:black" />
      <circle cx="20" cy="0" r="15" style="stroke:black;fill:none" />
    </g>
    <g transform="rotate(-20)" id="zekering_automatisch">
      <line x1="0" y1="-30" x2="0" y2="0"  stroke="black" />
      <rect x="-4" y="-30" width="4" height="10" style="fill:black" />
    </g>
    <g id="zekering_smelt">
      <rect x="-4" y="-30" width="8" height="30" style="stroke:black;fill:none" />
      <line x1="0" y1="-30" x2="0" y2="0" stroke="black" />
    </g>
    <g transform="rotate(-20)" id="zekering_empty">
      <line x1="0" y1="-30" x2="0" y2="0"  stroke="black" />
    </g>
    <g id="arrow">
      <line x1="0" y1="0" x2="8" y2="0" stroke="black" />
      <line x1="8" y1="0" x2="5" y2="-1" stroke="black" />
      <line x1="8" y1="0" x2="5" y2="1" stroke="black" />
    </g>
    <g id="gas_ventilator">
      <polygon points="-6,5.2 0,-5.2 6,5.2" fill="black" stroke="black" />
    </g>
    <g id="gas_atmosferisch">
      <polygon points="-6,5.2 0,-5.2 6,5.2" fill="white" stroke="black" />
    </g>
    <g id="bliksem">
      <line x1="0" y1="-5.2" x2="-3" y2="0" stroke="black"/>
      <line x1="-3" y1="0" x2="3" y2="0" stroke="black"/>
      <line x1="3" y1="0" x2="0" y2="5.2" stroke="black"/>
      <line x1="0" y1="5.2" x2="0" y2="2.2" stroke="black"/>
      <line x1="0" y1="5.2" x2="2.6" y2="3.7" stroke="black"/>
    </g>
    </defs>
    `
    return(output);
  }

  toSVG(myParent: number, stack: string, minxleft: number = 0) { //stack can be "horizontal" or "vertical"

    //--- First read all underlying elements in an Array called inSVG ---

    var inSVG: Array<SVGelement> = new Array<SVGelement>(); //Results from nested calls will be added here
    var elementCounter: number = 0;
    var lastChildOrdinal = 0;

    for (var i = 0; i<this.length; i++) {
      //empty tekst at the end does not count as a valid last child
      if (this.active[i] && (this.data[i].keys[16][2] != "zonder kader") && (this.data[i].parent == myParent)) lastChildOrdinal = i;
    }

    for (var i = 0; i<this.length; i++) {
      if (this.active[i] && (this.data[i].parent == myParent)) {
        switch (this.data[i].getKey("type")) {
          case "Bord":
            //get image of the entire bord
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");
            inSVG[elementCounter].xright += 10;
            if (this.data[i].getKey("geaard")) {
              if (inSVG[elementCounter].xleft <=100) {
                var toShift = 100-inSVG[elementCounter].xleft;
                inSVG[elementCounter].xleft = 100;
                inSVG[elementCounter].xright -= toShift;
              }
            } else {
              if (inSVG[elementCounter].xleft <=30) {
                var toShift = 30-inSVG[elementCounter].xleft;
                inSVG[elementCounter].xleft = 30;
                inSVG[elementCounter].xright -= toShift;
              }
            }
            if (inSVG[elementCounter].xright <=10) inSVG[elementCounter].xright = 10;

            //Ensure there is enough space to draw the bottom line
            inSVG[elementCounter].ydown = Math.max(inSVG[elementCounter].ydown,1);

            //Draw the bottom line
            inSVG[elementCounter].data = inSVG[elementCounter].data +
              '<line x1="4" x2="' + (inSVG[elementCounter].xleft + inSVG[elementCounter].xright-6) +
              '" y1="' + inSVG[elementCounter].yup + '" y2="' + inSVG[elementCounter].yup + '" stroke="black" stroke-width="3" />'

            //Add name of the board
            if (this.data[i].getKey("naam") !== "") {
              inSVG[elementCounter].data += '<text x="' + (0) + '" y="' + (inSVG[elementCounter].yup + 13) + '" ' +
                'style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="10">&lt;' +
                htmlspecialchars(this.data[i].getKey("naam"))+'&gt;</text>';
            };

            //Add an image of the grounding
            if (this.data[i].getKey("geaard")) {
              inSVG[elementCounter].data += '<line x1="40" y1="' + (inSVG[elementCounter].yup + 0) + '" x2="40" y2="' + (inSVG[elementCounter].yup + 10) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="40" y1="' + (inSVG[elementCounter].yup + 15) + '" x2="40" y2="' + (inSVG[elementCounter].yup + 25) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="40" y1="' + (inSVG[elementCounter].yup + 30) + '" x2="40" y2="' + (inSVG[elementCounter].yup + 40) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 10) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 10) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 15) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 15) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 25) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 25) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 30) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 30) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="30" y1="' + (inSVG[elementCounter].yup + 40) + '" x2="50" y2="' + (inSVG[elementCounter].yup + 40) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="32.5" y1="' + (inSVG[elementCounter].yup + 43) + '" x2="47.5" y2="' + (inSVG[elementCounter].yup + 43) + '" stroke="black" />';
              inSVG[elementCounter].data += '<line x1="35" y1="' + (inSVG[elementCounter].yup + 46) + '" x2="45" y2="' + (inSVG[elementCounter].yup + 46) + '" stroke="black" />';
            };
            break;

          case "Splitsing":
            //Algoritme werkt gelijkaardig aan een "Bord", eerst maken we een tekening van het geheel
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");

            //If child of "meerdere verbruikers, shift everything by 24 pixels to the right
            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Meerdere verbruikers") {
              if ((inSVG[elementCounter].xright + inSVG[elementCounter].xleft) <=0) inSVG[elementCounter].xrightmin = 15; // ensure we see there is a "splitsing"
              if (inSVG[elementCounter].yup < 25) inSVG[elementCounter].yup = 25;
              if (inSVG[elementCounter].ydown < 25) inSVG[elementCounter].ydown = 25;
              inSVG[elementCounter].data = inSVG[elementCounter].data +
                '<line x1="' + (1) + '" x2="' + (inSVG[elementCounter].xleft + inSVG[elementCounter].xrightmin) +
                '" y1="' + inSVG[elementCounter].yup + '" y2="' + inSVG[elementCounter].yup + '" stroke="black" />'
              var toShift = inSVG[elementCounter].xleft;
              inSVG[elementCounter].xleft -= toShift - 1; //we leave one pixel for the bold kring-line at the left
              inSVG[elementCounter].xright += toShift;
            } else {
              inSVG[elementCounter].data = inSVG[elementCounter].data +
                '<line x1="' + (inSVG[elementCounter].xleft) + '" x2="' + (inSVG[elementCounter].xleft + inSVG[elementCounter].xrightmin) +
                '" y1="' + inSVG[elementCounter].yup + '" y2="' + inSVG[elementCounter].yup + '" stroke="black" />'
            }
            break;

          case "Domotica":
            //Algoritme werkt gelijkaardig aan een "Bord" en "Splitsing", eerst maken we een tekening van het geheel
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");

            //Make sure there is always enough space to display the element
            if ((inSVG[elementCounter].xright + inSVG[elementCounter].xleft) <=100) inSVG[elementCounter].xright = (100 - inSVG[elementCounter].xleft) ;
            inSVG[elementCounter].yup = Math.max(inSVG[elementCounter].yup+20, 25);
            inSVG[elementCounter].ydown += Math.max(inSVG[elementCounter].ydown, 25);

            var width = (inSVG[elementCounter].xleft + inSVG[elementCounter].xright - 20);
            inSVG[elementCounter].data = inSVG[elementCounter].data +
              '<rect x="' + (20) + '" width="' + (width) +
              '" y="' + (inSVG[elementCounter].yup-20) + '" height="' + (40) + '" stroke="black" stroke-width="2" fill="white" />'
            inSVG[elementCounter].data = inSVG[elementCounter].data +
              '<line x1="0" x2="20" y1="' + (inSVG[elementCounter].yup) + '" y2="' + (inSVG[elementCounter].yup) + '" stroke="black" />'
            inSVG[elementCounter].data +=
              '<text x="' + (21 + width/2) + '" y="' + (inSVG[elementCounter].yup+3) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold">' + htmlspecialchars(this.data[i].keys[15][2]) + '</text>';

            var toShift = inSVG[elementCounter].xleft;
            inSVG[elementCounter].xleft -= toShift - 1; //we leave one pixel for the bold kring-line at the left
            inSVG[elementCounter].xright += toShift - 1;

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if (myParent != 0) {
              if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

                var y1, y2: number;
                if (i !== lastChildOrdinal) {
                  y1 = 0;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                } else {
                  y1 = inSVG[elementCounter].yup;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                }

                inSVG[elementCounter].data = inSVG[elementCounter].data +
                  '<line x1="' + inSVG[elementCounter].xleft +
                  '" x2="' + inSVG[elementCounter].xleft +
                  '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

                inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                  'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                  htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
              };
            };

            break;

          case "Meerdere verbruikers":
            //Algoritme werkt gelijkaardig aan een "Bord", eerst maken we een tekening van het geheel
            inSVG[elementCounter] = this.toSVG(this.id[i],"horizontal");

            //We voorzien altijd verticale ruimte, zelfs als de kinderen nog niet gedefinieerd zijn
            inSVG[elementCounter].ydown = Math.max(inSVG[elementCounter].ydown,25);
            inSVG[elementCounter].yup = Math.max(inSVG[elementCounter].yup,25);
            inSVG[elementCounter].xleft = Math.max(inSVG[elementCounter].xleft,1);

            //--plaats adres onderaan als nodig--
            if (!(/^\s*$/.test(this.data[i].keys[15][2]))) { //check if adres contains only white space
              inSVG[elementCounter].data += '<text x="' + ((inSVG[elementCounter].xright-20)/2 + 21) + '" y="' + (inSVG[elementCounter].yup+inSVG[elementCounter].ydown+10)
                + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.data[i].keys[15][2]) + '</text>';
              inSVG[elementCounter].ydown += 15;
            }

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if (myParent != 0) {
              if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

                var y1, y2: number;
                if (i !== lastChildOrdinal) {
                  y1 = 0;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                } else {
                  y1 = inSVG[elementCounter].yup;
                  y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
                }

                inSVG[elementCounter].data = inSVG[elementCounter].data +
                  '<line x1="' + inSVG[elementCounter].xleft +
                  '" x2="' + inSVG[elementCounter].xleft +
                  '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

                inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                  'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                  htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
              };
            };

            break;

          case "Aansluiting":
            //get image of the entire stack, make sure it is shifted to the right sufficiently so-that the counter can be added below
            inSVG[elementCounter] = this.toSVG(this.id[i],"vertical",150); //shift 100 to the right

            //add the fuse below

            inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
              '" x2="' + inSVG[elementCounter].xleft +
              '" y1="' + inSVG[elementCounter].yup +
              '" y2="' + (inSVG[elementCounter].yup+20) + '" stroke="black" />';
            inSVG[elementCounter].yup += 20;

            switch (this.data[i].getKey("zekering")) {
              case "automatisch":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") +"</text>";
                break;
              case "schemer":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_empty" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                 inSVG[elementCounter].data +=
                   '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                   '" y="' + (inSVG[elementCounter].yup-15) + '" />';
                 inSVG[elementCounter].data +=
                   '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                   '" y="' + (inSVG[elementCounter].yup-12) + '" />';
                break;
              case "differentieel":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+25) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+25) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                  " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  "\u0394" + htmlspecialchars(this.data[i].getKey("differentieel_waarde") + "mA") + "</text>";
                break;
              case "smelt":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_smelt" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "geen":
                inSVG[elementCounter].yup += 0;
                break;
            }

            //draw the counter
            inSVG[elementCounter].data += '<line x1="1" ' +
              'y1="' + (inSVG[elementCounter].yup+25) +
              '" x2="21" '+
              'y2="' + (inSVG[elementCounter].yup+25) + '" stroke="black"></line>';

            //draw outgoing connecting lines
            inSVG[elementCounter].data += '<line x1="60" ' +
              'y1="' + (inSVG[elementCounter].yup+25) +
              '" x2="' + (inSVG[elementCounter].xleft) + '" '+
              'y2="' + (inSVG[elementCounter].yup+25) + '" stroke="black"></line>';
            inSVG[elementCounter].data += '<line x1="' + (inSVG[elementCounter].xleft) +
              '" y1="' + (inSVG[elementCounter].yup) +
              '" x2="' + (inSVG[elementCounter].xleft) + '" '+
              'y2="' + (inSVG[elementCounter].yup+25) + '" stroke="black"></line>';

            //Draw the counter
            inSVG[elementCounter].data += '<use xlink:href="#elektriciteitsmeter" x="21" y="' + (inSVG[elementCounter].yup+25) + '"></use>';

            //set kabel type Text
            inSVG[elementCounter].data += '<text x="100" y="' + (inSVG[elementCounter].yup+40) +
               '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
               htmlspecialchars(this.data[i].getKey("kabel")) + '</text>';

            //inSVG[elementCounter].xleft = Math.max(inSVG[elementCounter].xleft,60);
            //inSVG[elementCounter].xright = Math.max(inSVG[elementCounter].xright,10);
            //Foresee sufficient room below for the counter
            inSVG[elementCounter].yup += 25;
            inSVG[elementCounter].ydown = 25;

            //If adres is not empty, put it below
            if (!(/^\s*$/.test(this.data[i].keys[15][2]))) { //check if adres contains only white space
              inSVG[elementCounter].data += '<text x="41" y="' + (inSVG[elementCounter].yup+inSVG[elementCounter].ydown+10) + '" style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-style="italic">' + htmlspecialchars(this.data[i].keys[15][2]) + '</text>';
              inSVG[elementCounter].ydown += 15;
            }

            //rework xleft and xright to ensure the entire structure is always at the right of a potential parent kring
            var width = inSVG[elementCounter].xleft + inSVG[elementCounter].xright;
            inSVG[elementCounter].xleft = 1;
            inSVG[elementCounter].xright = width-1;

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if (myParent != 0) {
            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

              var y1, y2: number;
              if (i !== lastChildOrdinal) {
                y1 = 0;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              } else {
                y1 = inSVG[elementCounter].yup;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              }

              inSVG[elementCounter].data = inSVG[elementCounter].data +
                '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

              inSVG[elementCounter].data +=
                '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
            };};

            break;

          case "Kring":
            //get image of the entire kring
            inSVG[elementCounter] = this.toSVG(this.id[i],"vertical");

            if (this.data[i].getKey("kabel_aanwezig")) {
              //foresee space for the conductor specifications
              inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + inSVG[elementCounter].yup +
                '" y2="' + (inSVG[elementCounter].yup+100) + '" stroke="black" />';
              inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                 "\" y=\"" + (inSVG[elementCounter].yup+80) +
                 "\"" +

                 " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                 "," + (inSVG[elementCounter].yup+80) +
                 ")" +

                  "\" style=\"text-anchor:start\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                 htmlspecialchars(this.data[i].getKey("kabel")) + "</text>";

              inSVG[elementCounter].yup += 100;
            } else {
              inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + inSVG[elementCounter].yup +
                '" y2="' + (inSVG[elementCounter].yup+20) + '" stroke="black" />';
              inSVG[elementCounter].yup += 20;
            }

            //add the fuse below

            switch (this.data[i].getKey("zekering")) {
              case "automatisch":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "schemer":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_empty" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                inSVG[elementCounter].data +=
                  '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                  '" y="' + (inSVG[elementCounter].yup-15) + '" />';
                inSVG[elementCounter].data +=
                  '<use xlink:href="#arrow" x=\"' + (inSVG[elementCounter].xleft-18) +
                  '" y="' + (inSVG[elementCounter].yup-12) + '" />';
                break;
              case "differentieel":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_automatisch" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+25) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+25) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " + this.data[i].getKey("amperage") + "A") + "</text>";
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                  "\" y=\"" + (inSVG[elementCounter].yup-10) +
                  "\"" +
                  " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                  "," + (inSVG[elementCounter].yup-10) +
                  ")" +
                  "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                  "\u0394" + htmlspecialchars(this.data[i].getKey("differentieel_waarde") + "mA") + "</text>";
                break;
              case "smelt":
                inSVG[elementCounter].yup += 30;
                inSVG[elementCounter].data +=
                  '<use xlink:href="#zekering_smelt" x=\"' + inSVG[elementCounter].xleft +
                  '" y="' + inSVG[elementCounter].yup + '" />';
                inSVG[elementCounter].data += "<text x=\"" + (inSVG[elementCounter].xleft+15) +
                   "\" y=\"" + (inSVG[elementCounter].yup-10) +
                   "\"" +
                   " transform=\"rotate(-90 " + (inSVG[elementCounter].xleft+15) +
                   "," + (inSVG[elementCounter].yup-10) +
                   ")" +
                    "\" style=\"text-anchor:middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"10\">" +
                   htmlspecialchars(this.data[i].getKey("aantal") + "P - " +  this.data[i].getKey("amperage") + "A") + "</text>";
                break;
              case "geen":
                inSVG[elementCounter].yup += 0;
                break;
            }

            //--Tekst naast de kring--
            var tekstlocatie = (inSVG[elementCounter].yup-40); //Standaard staat tekst boven de zekering
            if (this.data[i].getKey("zekering")=="geen") tekstlocatie+=25; //Als er geen zekering is kan tekst naar beneden
            inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft-6) + '" '
                  + 'y="' + (tekstlocatie) + '" '
                  + 'transform="rotate(-90 ' + (inSVG[elementCounter].xleft-6) + ',' + (tekstlocatie) + ')" '
                  + 'style="text-anchor:start" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12"'
                  + '>'
                  + htmlspecialchars(this.data[i].getKey("commentaar"))
                  + '</text>';

            //--Naam onderaan zetten (links-onder)--
            inSVG[elementCounter].data +=
                  '<text x="' + (inSVG[elementCounter].xleft-6) + '" '
                  + 'y="' + (inSVG[elementCounter].yup+3) + '" '
                  //+ 'transform="rotate(-90 ' + (inSVG[elementCounter].xleft-6) + ',' + (inSVG[elementCounter].yup+3) + ')" '
                  + 'style="text-anchor:end" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="12"'
                  + '>'
                  + htmlspecialchars(this.data[i].getKey("naam"))
                  + '</text>';

            //--Lijntje onder de zekering--
            inSVG[elementCounter].data += '<line x1="' + inSVG[elementCounter].xleft +
            '" x2="' + inSVG[elementCounter].xleft +
            '" y1="' + inSVG[elementCounter].yup +
            '" y2="' + (inSVG[elementCounter].yup+15) + '" stroke="black" />';
            inSVG[elementCounter].yup += 15;

            //if there is nothing, still draw an empty one
            if (inSVG[elementCounter].yup <= 0) {
              inSVG[elementCounter].xleft = 20;
              inSVG[elementCounter].xright = 20;
              inSVG[elementCounter].yup = 50;
              inSVG[elementCounter].ydown = 0;
            }

            break;

          case "":
            inSVG[elementCounter] = new SVGelement();
            break;

          default:
            //get image of all lowest level elements

            //First get the image itself
            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Meerdere verbruikers") {
              //the following function takes true as an argument if there is still an element following in a horizontal chain.
              //This is the case if the element is not last and/or not followed by empty tekst without border
              inSVG[elementCounter] = this.data[i].toSVG(i !== lastChildOrdinal);
            } else {
              inSVG[elementCounter] = this.data[i].toSVG(false);
            }

            //If direct child of a Kring, put a vertical pipe and "nr" at the left
            if ((this.data[this.getOrdinalById(myParent)]).getKey("type") == "Kring") {

              var y1, y2: number;
              if (i !== lastChildOrdinal) {
                y1 = 0;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              } else {
                y1 = inSVG[elementCounter].yup;
                y2 = inSVG[elementCounter].yup + inSVG[elementCounter].ydown;
              }

              inSVG[elementCounter].data = inSVG[elementCounter].data +
                '<line x1="' + inSVG[elementCounter].xleft +
                '" x2="' + inSVG[elementCounter].xleft +
                '" y1="' + y1 + '" y2="' + y2 + '" stroke="black" />'

              inSVG[elementCounter].data +=
                '<text x="' + (inSVG[elementCounter].xleft+9) + '" y="' + (inSVG[elementCounter].yup - 5) + '" ' +
                'style="text-anchor:middle" font-family="Arial, Helvetica, sans-serif" font-size="10">' +
                htmlspecialchars(this.data[i].getKey("naam"))+'</text>';
            };

        }
        elementCounter++;

        //outSVG.xleft = Math.max(outSVG.xleft,inSVG[elementCounter].xleft);
      }
    }

    //--- If there are no elements, make at least an empty one to avoid problems here below ---

    if (elementCounter == 0) {
      inSVG[0] = new SVGelement();
    }

    //--- Now create the output element ---

    var outSVG: SVGelement = new SVGelement;
    outSVG.xleft = 0; outSVG.xright = 0; outSVG.yup = 0; outSVG.ydown = 0;
    outSVG.data = "";

    var width: number = 0; //How wide is the structure?
    var height: number = 0; //How high is the structure?

    switch (stack) {
      case "horizontal":

        var max_yup : number = 0; //What is the maximal distance above the horizontal line?
        var max_ydown : number = 0; //What is the maximal distance below the horizontal line?

        //analyse the size of the structure. Build horizontally
        for (var i = 0; i<elementCounter; i++) {
          width = width + inSVG[i].xleft + inSVG[i].xright;
          max_yup = Math.max(max_yup,inSVG[i].yup);
          max_ydown = Math.max(max_ydown,inSVG[i].ydown);
        }
        height = max_yup + max_ydown;

        //decide on the output structure
        if (elementCounter > 0) {
          outSVG.xleft = inSVG[0].xleft; //Leave space of the first element at the left
          outSVG.xright = width - outSVG.xleft;
          outSVG.xrightmin = outSVG.xright - inSVG[elementCounter-1].xright;
        } else {
          outSVG.xleft = 0;
          outSVG.xright = 0;
          outSVG.xrightmin = 0;
        };
        outSVG.yup = max_yup;
        outSVG.ydown = max_ydown;

        //--Create the output data--
        var xpos:number = 0;

        for (var i = 0; i<elementCounter; i++) {
          outSVG.data += '<svg x="' + xpos + '" y="' + (max_yup-inSVG[i].yup) + '">';
          outSVG.data += inSVG[i].data;
          outSVG.data += '</svg>';
          xpos += inSVG[i].xleft + inSVG[i].xright;
        }

        break;

      case "vertical":

        var max_xleft : number = 0; //What is the maximal distance left of the vertical line?
        var max_xright : number = 0; //What is the maximal distance right of the vertical line?

        //analyse the size of the structure. Build vertically
        for (var i = 0; i<elementCounter; i++) {
          height = height + inSVG[i].yup + inSVG[i].ydown;
          max_xleft = Math.max(max_xleft,inSVG[i].xleft);
          max_xright = Math.max(max_xright,inSVG[i].xright);
        }
        max_xleft = Math.max(minxleft, max_xleft);
        width = max_xleft + max_xright;

        //decide on the output structure
        outSVG.yup = height; //As a general rule, there is no ydown, but to be confirmed
        outSVG.ydown = 0;
        outSVG.xleft = Math.max(max_xleft,35); // foresee at least 30 at the left
        outSVG.xright = Math.max(max_xright,25); // foresee at least 25 at the right

        //create the output data
        var ypos:number = 0;

        for (var i = elementCounter-1; i>=0; i--) {
          outSVG.data += '<svg x="' + (outSVG.xleft-inSVG[i].xleft) + '" y="' + ypos + '">';
          outSVG.data += inSVG[i].data;
          outSVG.data += '</svg>';
          ypos += inSVG[i].yup + inSVG[i].ydown;
        }

        break;
    }

    //alert("stack = " + stack + " width = " + width + "height = " + height  + " yup = " + outSVG.yup + "ydown = " + outSVG.ydown);

    outSVG.data += "\n";

    if (myParent==0) { //We will always foresee a 20 pixel horizontal and 5 pixel vertical margin
      var header: string = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" transform=\"scale(1,1)\" width=\"" + (width + 20) + "\" height=\"" + (height + 5) + "\">";
      header += this.outputSVGDefs();
      var footer: string = "</svg>";
      outSVG.data = header+outSVG.data+footer;
    }

    return(outSVG);

  }

}
