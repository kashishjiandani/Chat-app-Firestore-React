import React from 'react'
import {HStack,Avatar,Text} from '@chakra-ui/react'

function Message({text,uri,user='other'}) {
  return (
    <HStack alignSelf={user==='me'?"flex-end":"flex-start"} bg={'gray.300'} paddingX={"4"} paddingY={"2"} borderRadius={'base'}>
        {user==='other' && <Avatar src={uri}/>}
        <Text>{text}</Text>
        {user==='me' && <Avatar bg='pink.300' src={uri}/>}
    </HStack>
  )
}

export default Message