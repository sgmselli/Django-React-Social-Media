import { Text, VStack, Flex, Box, Heading, HStack, Image, Button, Spacer } from "@chakra-ui/react"
import { useState, useEffect } from "react";
import { get_user_profile_data, get_users_posts, toggleFollow } from "../api/endpoints";
import { SERVER_URL } from "../constants/constants";

import Post from "../components/post";

const UserProfile = () => {

    const get_username_from_url = () => {
        const url_split = window.location.pathname.split('/');
        return url_split[url_split.length-1]
    }

    const [username, setUsername] = useState(get_username_from_url())

    useEffect(() => {
        setUsername(get_username_from_url())
    }, [])

    return (
        <Flex w='100%' justifyContent='center'>
            <VStack w='75%'>
                <Box w='100%' mt='40px'>
                    <UserDetails username={username} />
                </Box>
                <Box w='100%' mt='50px'>
                    <UserPosts username={username} />
                </Box>
            </VStack>
        </Flex>
    )
}

const UserDetails = ({username}) => {

    const [loading, setLoading] = useState(true)
    const [bio, setBio] = useState('')
    const [profileImage, setProfileImage] = useState('')
    const [followerCount, setFollowerCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)

    const [isOurProfile, setIsOurProfile] = useState(false)
    const [following, setFollowing] = useState(false)

    const handleToggleFollow = async () => {
        const data = await toggleFollow(username);
        if (data.now_following) {
            setFollowerCount(followerCount+1)
            setFollowing(true)
        } else {
            setFollowerCount(followerCount-1)
            setFollowing(false)
        }
    }

    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = await get_user_profile_data(username);
                setBio(data.bio)
                setProfileImage(data.profile_image)
                setFollowerCount(data.follower_count)
                setFollowingCount(data.following_count)

                setIsOurProfile(data.is_our_profile)
                setFollowing(data.following)
            } catch {
                console.log('error')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
        
    }, [])

    return (
        <VStack w='100%' alignItems='start' gap='40px'>
            <Heading>@{username}</Heading>
            <HStack gap='20px'>
                <Box boxSize='150px' border='2px solid' borderColor='gray.700' bg='white' borderRadius='full' overflow='hidden'>
                    <Image src={loading ? '' : `${SERVER_URL}${profileImage}`} boxSize='100%' objectFit='cover' />
                </Box>
                <VStack gap='20px'>
                    <HStack gap='20px' fontSize='18px'>
                        <VStack>
                            <Text>Followers</Text>
                            <Text>{ loading ? '-' : followerCount}</Text>
                        </VStack>
                        <VStack>
                            <Text>Following</Text>
                            <Text>{ loading ? '-' : followingCount}</Text>
                        </VStack>
                    </HStack>
                    {
                        loading ?
                            <Spacer />
                        :

                            isOurProfile ?
                                <Button w='100%'>Edit Profile</Button>
                            :
                                <Button onClick={handleToggleFollow} colorScheme="blue" w='100%'>{following ? 'Unfollow' : 'Follow'}</Button>
                    }
                
                </VStack>
            </HStack>
            <Text fontSize='18px'>{ loading ? '-' : bio}</Text>
        </VStack>
    )
}

const UserPosts = ({username}) => {

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchPosts = async () => {
            try {
                const posts = await get_users_posts(username)
                setPosts(posts)
            } catch {
                alert('error getting users posts')
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()

    }, [])

    return (
        <Flex w='100%' wrap='wrap' gap='30px' pb='50px'>
            {loading ?
                <Text>Loading...</Text>
            :
                posts.map((post) => {
                    return <Post key={post.id} id={post.id} username={post.username} description={post.description} formatted_date={post.formatted_date} liked={post.liked} like_count={post.like_count} />
                })
            }
        </Flex>
    )
}








export default UserProfile