var bible = false;
var source = "no source";
var passage = "no passage";

function ping_stat_server(verse, text, correct){
  if($("#send_stats").is(":checked")){
    $(document).ready(function () {
      $.ajax({
        type: "GET",
        url: "http://bibleorquran.org:61004/verse="+verse+";text=" + text+ ";correct="+correct,
        cache: false,
        dataType: "html",
        success: function(html) {
          console.log("successfully pinged stat server: " + verse + "," + text + "," + correct)
        }
      });
    });
  }
}

function quran_verse(){
  $(document).ready(function () {
    $.ajax({
      type: "GET",
      url: "http://quranapi.azurewebsites.net/api/verse/?lang=en",
      cache: false,
      dataType: "xml",
      success: function(xml) {
        var local_text = "Unknown text";
        var chapter = "Unknown chapter";
        var id = "Unknown id"
        $(xml).find('VerseView').each(function(){
          local_text = $(this).find("Text").text();
          chapter = $(this).find("ChapterName").text()
          id = $(this).find("Id").text()
        });
        bible = false;
        source = "Qur'an, " + chapter + " " + id;
        passage = ambig(local_text);
        load_verse(passage, source);
      }
    });
  });
}

function bible_verse(){
  $(document).ready(function () {
    $.ajax({
      type: "GET",
      url: "http://labs.bible.org/api/?passage=random&type=json&callback=?",
      cache: false,
      dataType: "jsonp",
      success: function(json) {
        console.log(json);
        response = json[0];
        var verse = "Unknown verse";
        passage = ambig(response.text);
        bible = true;
        source = "Bible, " + response.bookname + " " + response.chapter + ":" + response.verse;
        load_verse(passage, source);
      }
    });
  });
}

function rand(){
  return Math.random() >= 0.5;
}

function start_load_process(){
  $("#passage").text("Loading...");
  $("#biblequraninterface").hide();
  $("#start-button").attr("disabled",true);
  $("#continue").attr("disabled",true);
  if(rand()){
    bible_verse();
  }else{
    quran_verse();
  }
}

function load_verse(passage2, source2){
  $("#interface").hide();
  $("#welcome").hide();
  $("#passage").text(passage)
  $("#passage").fadeIn();
  $("#right").hide();
  $("#wrong").hide();
  $("#biblequraninterface").fadeIn();
}

var correct = 0.0;
var incorrect = 0.0;

function getScore(){
  return correct - incorrect;
}

function updateScoreboard(){
  $("#numcorrect").text(correct);
  $("#numincorrect").text(incorrect);
  $(".score").text(getScore())
  var widthcorrect = correct / (correct + incorrect) * 100;
  var widthincorrect = 100 - widthcorrect;
  $("#progress-correct").css("width", widthcorrect + "%");
  $("#progress-incorrect").css("width", widthincorrect + "%");
  $("#twitter-button").attr("href", "https://twitter.com/intent/tweet?text=Just%20got%20a%20score%20of%20" + getScore() + "%20on%20BibleOrQuran.org!%20Can%20you%20beat%20mine?");
}

function answer(response){
  $(".verse-source").text(source);
  $("#biblequraninterface").hide();
  if(response == bible){
    $("#right").fadeIn();
    correct += 1;
  }else{
    $("#wrong").fadeIn();
    incorrect += 1;
  }
  updateScoreboard();
  var cor_s = "False";
  if(response == bible){
    cor_s = "True";
  }
  var src = "quran";
  if(bible){
    src = "bible";
  }
  ping_stat_server(source, src, cor_s);
  $("#continue").attr("disabled",false);
  $("#interface").fadeIn();
}

function ambig(verse){
  verse = verse.replace("<a style=\"\" target=\"_blank\" href=\"http:\/\/bible.org\/page.php?page_id=3537\">&copy;NET<\/a>", "")
  String.prototype.replaceAll = function(strReplace, strWith) {
    var reg = new RegExp(strReplace, 'ig');
    return this.replace(reg, strWith);
  };
  verse = verse.replaceAll("God", "[God]");
  verse = verse.replaceAll("LORD", "[God]");
  verse = verse.replaceAll("Lord", "[God]");
  verse = verse.replaceAll("Allah", "[God]");
  verse = verse.replaceAll("Muhammad", "[Earthly Figure]");
  verse = verse.replaceAll("Jesus", "[Earthly Figure]");
  verse = verse.replaceAll("Bible", "[Holy Text]");
  verse = verse.replaceAll("Qur'an", "[Holy Text]");
  verse = verse.replaceAll("Christian", "[Follower]");
  verse = verse.replaceAll("Muslim", "[Follower]");
  verse = $("<textarea/>").html(verse).text();
  return verse;
}
