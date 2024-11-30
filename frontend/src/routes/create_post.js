import { VStack, Flex, Heading, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { create_post } from "../api/endpoints";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {

    const [description, setDescription] = useState('')
    const nav = useNavigate()

    const handlePost = async () => {
        try {   
            await create_post(description)
            nav('/')
        } catch {
            alert('error creating post')
        }
    }

    return (
        <Flex w='100%' h='100%' justifyContent='center' pt='50px'>
            <VStack w='95%' maxW='450px' alignItems='start' gap='40px'>
                <Heading>Create Post</Heading>
                <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input onChange={(e) => setDescription(e.target.value)} bg='white' type='text'/>
                </FormControl>
                <Button onClick={handlePost} w='100%' colorScheme="blue">Create Post</Button>
            </VStack>
        </Flex>
    )
}

export default CreatePost;