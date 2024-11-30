import { Heading, VStack, Text, Flex, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { get_posts } from "../api/endpoints";
import Post from "../components/post";

const Home = () => {

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [nextPage, setNextPage] = useState(1)

    const fetchData = async () => {
        const data = await get_posts(nextPage)
        setPosts([...posts, ...data.results])
        setNextPage(data.next ? nextPage+1 : null)
    }

    useEffect(() => {
        try {
            fetchData()
        } catch {
            alert('error getting posts')
        } finally {
            setLoading(false)
        }
    }, [])

    const loadMorePosts = () => {
        if (nextPage) {
            fetchData()
        }
    }

    return (
        <Flex w='100%' justifyContent='center' pt='50px'>
            <VStack alignItems='start' gap='20px' pb='50px'>
                <Heading>Posts</Heading>
                {
                    loading ?
                        <Text>Loading...</Text>
                    :
                        posts ?
  
                            posts.map((post) => {
                                return <Post key={post.id} id={post.id} username={post.username} description={post.description} formatted_date={post.formatted_date} liked={post.liked} like_count={post.like_count} />
                            })
                             
                        :

                        <></>
                    
                }

                {
                    nextPage && !loading && (
                        <Button onClick={loadMorePosts} w='100%'>Load More</Button>
                    )
                }

            </VStack>
        </Flex>
    )
}

export default Home;