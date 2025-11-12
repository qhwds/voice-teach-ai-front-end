import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login.vue';
import Register from '../views/register.vue';
import Home from '../components/home.vue'
import Addload from "@/views/addload.vue";
import Ppt from "@/views/ppt.vue";
import SoundLibrary from "@/views/soundLibrary.vue";
import Texttospeech12 from "@/views/texttospeech1.2.vue";
import Texttospeech from "@/views/texttospeech.vue";
import Enlogin from "@/views/enlogin.vue";
import Enregister from "@/views/enregister.vue";
import Test from "@/components/test.vue";
import Audio from "@/components/Audio.vue";
import Test2 from "@/components/test2.vue";
import SelectVoice from "@/components/select-voice.vue";
import SetVoice from "@/components/set-voice.vue";
import HistoryPage from "@/components/history-page.vue";
import AudioTest from "@/components/Audio-test.vue";

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/home',
        component: Home
    },
    {
        path: '/Addload',
        component: Addload
    },
    {
        path: '/Ppt',
        component: Ppt
    },
    {
        path: '/SoundLibrary',
        component: SoundLibrary
    },
    {
        path: '/text-to-speech',
        component: Texttospeech
    },
    {
        path: '/text-to-speech12',
        component: Texttospeech12
    },
    {
        path: '/Test',
        component: Test
    },
    {
        path: '/Test2',
        component: Test2
    },
    {
        path: '/en-login',
        component: Enlogin
    },
    {
        path: '/en-register',
        component: Enregister
    },
    {
        path: '/Audio',
        component: Audio
    },
    {
        path: '/Select-Voice',
        component: SelectVoice
    },
    {
        path: '/Set-Voice',
        component: SetVoice
    },
    {
        path: '/History-Page',
        component: HistoryPage
    },
    {
        path: '/Audio-Test',
        component: AudioTest
    },

];


const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL || '/'),
    routes,
});


export default router;
