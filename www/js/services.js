angular.module('starter.services', [])

.factory('Consultants', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var consultants = [{
    id: 0,
    name: '山名　裕子',
    lastText: '私は『認知行動療法』を専門としていて、認知に働きかけて気持ちを楽にする心理療法を取り入れています。日本ではカウンセリングというのがあまり身近ではないのですが、日常的な悩みがある方や心の持ちようを変えたい方にも通って頂きたいと思っているんです。少し考え方を変えるだけで、ぐっと楽になります。',
    face: 'http://suppin.info/wp-content/uploads/2014/07/01.png'
  }, {
    id: 1,
    name: '伊藤　弥生',
    lastText: '不妊にお悩みの方は、治療のこと、人間関係、生活設計・人生設計などストレスフル。どんなに大きな船でも、積荷が大きすぎれば揺れるもの。心のメンテナンスやケアもなさってみてはいかがでしょうか？皆様が納得できる路を安心してお進みになれることを心から願っております。どうぞお気軽にお声をおかけください。',
    face: 'http://www.kuramoto.or.jp/aboutus/photo/ito.jpg'
  },{
    id: 2,
    name: '棚田　克彦',
    lastText: '投資銀行勤務時代にトレーディングや金融新商品の開発に従事するかたわら、巨額のお金を動かすストレスから自身のメンタル面をコントロールする必要性を実感し、本格的にNLP（神経言語プログラミング）を学び始める。',
    face: 'http://stat.profile.ameba.jp/profile_images/eb/tanada-nlp/1160027574080.jpg'
  }];

  return {
    all: function() {
      return consultants;
    },
    remove: function(chat) {
      consultants.splice(consultants.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < consultants.length; i++) {
        if (consultants[i].id === parseInt(chatId)) {
          return consultants[i];
        }
      }
      return null;
    }
  };
})


.factory('signaling', function (socketFactory) {
  var socket = io.connect('https://mzap-sig.herokuapp.com/');
  
  var socketFactory = socketFactory({
    ioSocket: socket
  });

  return socketFactory;
});