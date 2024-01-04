//File mainly for utility functions so far its just a format function for date and Search Text Parse


 export function formatMetaDataDate(aDate){
    let currentTimeDate = new Date();
    let timeDifference = currentTimeDate.getTime() - aDate.getTime(); 
    let MonthMap = { 0:"Jan", 1:"Feb", 2:"Mar", 3: "Apr", 4:"May", 5:"Jun", 6:"Jul", 7: "Aug", 8:"Sep", 9:"Oct", 10: "Nov", 11: "Dec"};
    //get time returns a time in miliseconds first check if time is less than a minute
    //check if less than a minute
    if(timeDifference < (60* 1000)){
      return parseInt(timeDifference/1000) + " seconds ago"
    }
    //check if less than an hour
    else if(timeDifference < (3600 *1000)){
      return parseInt((timeDifference/1000)/60) + " minutes ago"
    }
    //check if less than a day
    else if(timeDifference < (86400*1000)){
      return parseInt((timeDifference/1000)/3600) + " hours ago" 
    }
    //check if greater than a year
    let yearDifference = currentTimeDate.getFullYear() - aDate.getFullYear();
    let formatedHours = aDate.getHours() < 10 ? "0"+aDate.getHours() : aDate.getHours().toString();
    let formattedMinutes = aDate.getMinutes() < 10 ? "0"+aDate.getMinutes() : aDate.getMinutes().toString();;
    if (yearDifference > 1){
      return MonthMap[aDate.getMonth()] + " " + aDate.getDate() + ", " + aDate.getFullYear() + " at " + formatedHours + ":" + formattedMinutes;
    }
    
    if (yearDifference === 1){
      //double check months if its
      if(currentTimeDate.getMonth() > aDate.getMonth() || (currentTimeDate.getMonth() === aDate.getMonth() && currentTimeDate.getDay() >= aDate.getDay())){
        return MonthMap[aDate.getMonth()] + " " + aDate.getDate() + ", " + aDate.getFullYear() + " at " + formatedHours + ":" + formattedMinutes;
      }
    }
    //if not return Month Day hh:min
    return MonthMap[aDate.getMonth()] + " " + aDate.getDate() + " at " + formatedHours + ":" + formattedMinutes; 
  }


  export function parseSearchBarInput(searchBarInput){
    let fullSearchText = searchBarInput; // assignment cuz i want to just copy and paste old code lol 
    let i = 0;
    let j = 0;
    let searchText = "";
    let listOfTags = [];
    //begin to parse the search text
    while(i < fullSearchText.length){
      //Two main Scenarios
      //1. we start with a tag so opening bracket [
      // and we move j till we get a closing bracket ]
      //2. We get a regular char and we start moving j till we reach the end of the string or reach a [
      if(fullSearchText[i] === "["){
        j = i+1;
        while(fullSearchText[j] !== "]" && j < fullSearchText.length){
          j++;
        }
        let currentTag = fullSearchText.slice(i+1,j);
        listOfTags.push(currentTag);
        i = j;
        i++;
      }
      else{
        //NOTE when splicing for the non tag search string might have to trim the string to remove spaces
        j = i+1;
        while(j < fullSearchText.length && fullSearchText[j] !== "["){
          j++;
        }
        searchText = fullSearchText.slice(i,j).trim();
        i=j;
      }
    }
    searchText = searchText.toLowerCase();
    return {searchText,listOfTags};
}

export function validateHyperLink(someText){
  let invalidHyperLinks = false;
  let i = 0;
  let indexOfOpenSqrBracket = someText.indexOf('[', i);
  
  while(indexOfOpenSqrBracket!== -1){
    i = indexOfOpenSqrBracket+1;
    let indexOfClosingBracket = someText.indexOf(']',indexOfOpenSqrBracket);

    if(indexOfClosingBracket !== -1 ){
      //Check if the next character is a open parenthesis
      if(someText[indexOfClosingBracket+1] === '('){
        let spliceFromOpeningParenthesis = someText.substring(indexOfClosingBracket+1);
        let indexOfClosingParenthesis = someText.indexOf(')');
        if(indexOfClosingParenthesis !== -1){
          //Then this case is where we have the () so look inside

          let hyperlinkSplice = spliceFromOpeningParenthesis.substring(1,indexOfClosingParenthesis);
          if((hyperlinkSplice.substring(0,7) !== "http://" && hyperlinkSplice.substring(0,8) !== "https://") || hyperlinkSplice.length===0){
            invalidHyperLinks = true;
          }
          
        }     
      }
    }
    indexOfOpenSqrBracket = someText.indexOf('[',i);
  }
  return invalidHyperLinks;
}

export function getHyperLinksFromText(aid,someText){
  let listOfHyperLinkStrings = [];
  let i = 0;
  let j = 0; //where the last hyper link ended
  let indexOfOpenSqrBracket = someText.indexOf('[', i);
  let spanNum = 1;
  let linkNum = 1;
  while(indexOfOpenSqrBracket!== -1){
    
    i = indexOfOpenSqrBracket+1;
    
    let indexOfClosingBracket = someText.indexOf(']',indexOfOpenSqrBracket);

    if(indexOfClosingBracket !== -1 ){
      //Check if the next character is a open parenthesis
      if(someText[indexOfClosingBracket+1] === '('){
        let spliceFromOpeningParenthesis = someText.substring(indexOfClosingBracket+1);
        let indexOfClosingParenthesis = someText.indexOf(')',indexOfClosingBracket);
        if(indexOfClosingParenthesis !== -1){
          //Then this case is where we have the () so look inside

          let hyperlinkSplice = spliceFromOpeningParenthesis.substring(1,indexOfClosingParenthesis-(indexOfClosingBracket+1));
          if((hyperlinkSplice.substring(0,7) !== "http://" && hyperlinkSplice.substring(0,8) !== "https://") || hyperlinkSplice.length===0){
           
          }
          else{
            listOfHyperLinkStrings.push(<span key= {"span-"+spanNum+"-"+aid}>{someText.substring(j,indexOfOpenSqrBracket)}</span> );
            spanNum++;
            //listOfHyperLinkStrings.push(someText.substring(indexOfOpenSqrBracket,indexOfClosingParenthesis+1));
            listOfHyperLinkStrings.push(<a key ={"a-"+linkNum+"-"+aid} href={hyperlinkSplice}>{someText.substring(indexOfOpenSqrBracket+1,indexOfClosingBracket)}</a>);
            j = indexOfClosingParenthesis+1;
            linkNum++;
          }
          
        }     
      }
    }
    indexOfOpenSqrBracket = someText.indexOf('[',i);
  }
  return listOfHyperLinkStrings;
}


export function formatUserTimeStamp(timeStamp){
  //Meant to be used with the users createdAt field where we can get how long they've been a member
  let MonthMap = { 0:"Jan", 1:"Feb", 2:"Mar", 3: "Apr", 4:"May", 5:"Jun", 6:"Jul", 7: "Aug", 8:"Sep", 9:"Oct", 10: "Nov", 11: "Dec"};

  return MonthMap[timeStamp.getMonth()] + " " + timeStamp.getDate() + ", " + timeStamp.getFullYear();


}


export function formatListOfTags(tags){
  //Meant to be used for the rendering of tags when they get spat back out as objects for the text input
  //in the editing question page
  let tagString =tags.map(tag=>{
    return tag.name;
  }).join(' '); //basically create new list with just names. then join with empty space between

  return tagString;
}
//Modify the above but for the embed hyper link what we need to do is 
//look for the lists of regular text and lists of hyperlinks and zip em together
//OR...we find the list of hyperlinks use a regex to replace each instance of it with
// a return that returns <a> 