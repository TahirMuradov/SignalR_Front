'use client'
import React, { FormEvent, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';


interface ChatDataType {
  CurrentuserConnectionId: string;
  message: string[];
  sendtoConnectionId: string | null | undefined;
}

const Chat = () => {
  const [chatData, setChatData] = useState<ChatDataType>({
    CurrentuserConnectionId: '',
    message: [],
    sendtoConnectionId: null,
  });


  const currentUserConnectionIdRef = useRef<HTMLInputElement>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7097/api/myhub',{ withCredentials: true })
      .build();

    connection.start()
      .then(() => {
        console.log('Connection started!');
        
       
        const connectionId = connection.connectionId;

        
        if (connectionId) {
         
          if (currentUserConnectionIdRef.current) {
            currentUserConnectionIdRef.current.value = connectionId;
          }
        } else {
          console.error('Connection ID is null');
        }
        
      
        connection.on('receiveMessage', (fromToConnectionId: string, message: string, sendToconnectionId: string | null) => {
          console.log('Message received:', message);

          setChatData((prevChatData) => ({
            ...prevChatData,
            CurrentuserConnectionId: fromToConnectionId,
            message: [...prevChatData.message, message],
            sendtoConnectionId: sendToconnectionId || null,
          }));
        });
      })
      .catch((err: any) => console.error('Connection failed: ', err));

   
    connectionRef.current = connection;

   
    return () => {
      connection.stop();
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const currentId = formData.get('CurrentuserConnectionId') as string;
    const messageText = formData.get('message') as string;
    const sendToId = formData.get('sendtoConnectionId') as string | null;

    if (connectionRef.current) {
      connectionRef.current.invoke('SendMessage', currentId, messageText, sendToId)
        .catch((err: any) => console.error(err.toString()));
    }
  };

  return (
    <form className='w-full max-w-lg bg-white p-6' id='chat' onSubmit={handleSubmit}>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="CurrentuserConnectionId">
            Sizin ConnectionId
          </label>
          <input
            name='CurrentuserConnectionId'
            id='CurrentuserConnectionId'
            ref={currentUserConnectionIdRef}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            readOnly 
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="sendtoConnectionId">
            Mesaj Göndərmək Istədiyiniz Istifadəçinin ConnectionId-si
          </label>
          <input
            name='sendtoConnectionId'
            id='sendtoConnectionId'
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
          />
          <p className="text-gray-600 text-xs italic">Mesajinizin Hamı tərəfindən görülməyini istəyirsinizsə bu sahəni boş buraxin</p>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full px-3">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="message">
            Mesaj
          </label>
          <input
            name='message'
            id='message'
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
          />
        </div>
      </div>
      <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded" type="submit">
        send
      </button>

      <div className="mt-4">
        <h3 className="text-lg font-bold">Gelen Mesajlar:</h3>
        <ul>
          {chatData.message.map((msg, index) => (
            <li key={index} className="text-gray-700">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}

export default Chat;
