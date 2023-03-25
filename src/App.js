import { useState,useEffect,useRef } from 'react';
import {Box,Container,VStack,HStack,Button,Input} from '@chakra-ui/react'
import Message from './components/Message';
import {app} from './firebase'
import {signOut, onAuthStateChanged, getAuth,GoogleAuthProvider,signInWithPopup} from 'firebase/auth';
import {addDoc,collection,getFirestore, onSnapshot, serverTimestamp,query,orderBy} from 'firebase/firestore';

const auth=getAuth(app);
const db =getFirestore(app);



const loginHandler = () =>{
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth,provider);
}

const logoutHandler = () =>{
  signOut(auth);
}


function App() {

  const [user, setUser] = useState(false)
  const [msg, setMsg] = useState("")
  const [msgs,setMsgs] = useState([])

  const divForScroll = useRef(null);

  // console.log(user);

  useEffect(() => {
    
    const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onAuthStateChanged(auth,(data)=>{
      // console.log(data)
      setUser(data);
    });

    const unsubscribeMsg = onSnapshot(q,(snap)=>{
      setMsgs
      (
        snap.docs.map((item)=>{
          const id=item.id;
          return{id,...item.data()}
        })
      )
    })

    return () => {
      unsubscribe();
      unsubscribeMsg();
    };
  }, [])

  const submitHandler = async(e) =>{
    e.preventDefault();
    
    try {
      console.log(user.uid,user.photoURL)
      await addDoc(collection(db,"Messages"),{
        text:msg,
        uid:user.uid,
        uri:user.photoURL,
        createdAt:serverTimestamp()
      })
      setMsg("")
      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error);
    }
    // console.log(text,uid,uri,createdAt)
  }
  
  return (
    <Box bg={'pink.100'}>
    { user?(
      <Container bg={'white'} h={'100vh'}>
        <VStack h={'100vh'} paddingY={"4"} paddingX={"2"}>
        <Button colorScheme={'red'} w={'full'} onClick={logoutHandler}>Logout</Button>
        <VStack h={'full'} w={'full'} overflowY={'auto'} css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}>
        {msgs.map((item)=>(
        <Message key={item.id} text={item.text} uri={item.uri} user={item.uid===user.uid?"me":"other"} />
        ))}
        <div ref={divForScroll}></div>
        </VStack>
        <form onSubmit={submitHandler} style={{width:'100%'}}>
        <HStack>
          <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Enter a Message..."/>
          <Button type="submit" colorScheme={'pink'}>Send</Button>
        </HStack>
        </form>
        </VStack>
      </Container>):
      (<VStack bg={'white'} h={'100vh'} justifyContent={'center'}>
      <Button colorScheme={'pink'}  onClick={loginHandler}>Sign In with Google</Button>
    </VStack>)
    }
    </Box>

    
  );
}

export default App;
