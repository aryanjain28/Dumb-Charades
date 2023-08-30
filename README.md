# Dumb-Charades

Note: I've written a short blog on WebRTC, please read it and let me know you comments via email! :)

Welcome to a fun game of charades with a twist. 😄
I'll start with the game rules first, and then I'll talk about the technical details. 🎮🕹️

To begin, a virtual room needs to be created where all the players can join. 🏠👥 This room will have a unique ID that can be shared with others so they can join the game. 🔗

Once everyone is in the room, a random player will be selected. 🎲👤 This player will be given the name of a random movie to act out. Also, this player's webcam feed will start streaming to everyone else in the room. 🎥🍿

Now, the other players in the room will need to guess the name of the movie as quickly as possible. ⏱️🤔 They need to type their guesses and hit enter in the chatbox. The chatbox will also give you a hint about how close your guess is (in percentage). 📝🔍 The goal is to guess correctly and earn points. 🏆

Once someone correctly guesses the movie, the score will be updated, and another player will be selected to act out a different movie. 🎉🎬

Get ready for some exciting rounds of movie charades! 🍀🎭 Your creativity and quick thinking will be your best assets in this game. Let's have a blast! 💥🎉




## The Stack

1. WebRTC (Web Real-Time-Communication)
2. Socket.io
3. React
4. Node
5. UUID
6. MUI
7. and other great helpful stuff..

## The Tech

This project utilizes an SFU (Selective-Forwarding-Unit) network architecture to establish peer-to-peer connections. Specifically, each player's end (client or browser) creates a peer, which is then linked to another peer acting as the server. This peer is set up using the standard WebRTC provided by JavaScript.

SFU Architecture:

<img src="/ss/SFU.png" alt="SFU" style="width:400px;"/>


Starting with the video aspect, the designated player (referred to as the streamer) initiates a peer connection with the server. This enables them to stream their webcam feed to the server. The server captures this feed and awaits a connection request from a viewer. Once a viewer requests this connection, a new link is formed between the viewer and the server. Once established, the server starts transmitting the streamer's webcam feed to the viewer.

Now for the chatbox and events. The project incorporates Socket.io for implementing the chatbox and managing important events such as:

When a streamer joins, their webcam activates, and a peer connection is established.
If a streamer changes or leaves, a new streamer is selected, and a fresh connection is established.
When a viewer joins, they receive the stream and connect accordingly.
Updates to the score are managed.
Facilitating chat interactions and various other events.
In summary, this project employs SFU architecture for peer-to-peer connections, particularly utilizing WebRTC for creating peers. It focuses on streaming webcam feeds, managing connections, and employing Socket.io for chatbox features and event handling.


## Some fun Screenshots


1. Create or Join room
   
![Create or Join room](/ss/SS_1.png)

2. Streamer (muted webcam feed)

![Create or Join room](/ss/SS_8.png)

3. Viewer (will watch the streamer's video feed and try to quickly guess in the chatbox)

![Create or Join room](/ss/SS_12.png)


## Conclusion

Loved developing this project! Hope you liked the idea! ❤️
There are still many features that I wish to add to this! Will try to do that as I get some time!
Do let me know if you're you want to collaborate or have cool ideas! Cheers!















