import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList,
    Modal, Button, StyleSheet,
    Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import * as Animatable from 'react-native-animatable';
import { postFavorite, postComment } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId)),
    postComment: (campsiteId, rating, author, text) => (postComment(campsiteId, rating, author, text))
};

function RenderCampsite(props) {

    const {campsite} = props;

    const view = React.createRef();

    const recognizeDrag = ({dx}) => (dx < -200) ? true : false;
    const recognizeComment = ({dx}) => (dx > 200) ?true:false;


    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished' : 'canceled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + campsite.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()
                        }
                    ],
                    { cancelable: false }
                );
            } else if (recognizeComment(gestureState)) {
                props.onShowModal();
            }
            return true;
        }
    });

    if (campsite) {
        return (
            <Animatable.View
                animation='fadeInDown'
                duration={2000}
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}>
                <Card
                featuredTitle={campsite.name}
                image={{ uri: baseUrl + campsite.image }}>
                <Text style={{ margin: 10 }}>
                    {campsite.description}
                </Text>
                <View style={styles.cardRow}>
                    <Icon style={styles.cardItem}
                        name={props.favorite ? 'heart' : 'heart-o'}
                        type='font-awesome'
                        color='#f50'
                        raised
                        reverse
                        onPress={() => props.favorite ?
                            console.log('Already set as a favorite') : props.markFavorite()}
                    />
                    <Icon style={styles.cardItem}
                        name='pencil'
                        type='font-awesome'
                        color='#5637DD'
                        raised
                        reverse
                        onPress={() => props.onShowModal()}
                    />
                </View>
                </Card>
            </Animatable.View>
        );
    }
    return <View />;
}

function RenderComments({ comments }) {


    const renderCommentItem = ({ item }) => {
        return (
            <View style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.text}</Text>
                <Rating style={{ alignItems: 'flex-start', paddingVertical: '5%' }} startingValue= {item.rating} imageSize={10} readonly/>
                <Text style={{ fontSize: 12 }}>{`-- ${item.author}, ${item.date}`}</Text>
            </View>
        );
    };

    return (
        <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card title='Comments'>
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
            />
        </Card>
        </Animatable.View>
    );
}

class CampsiteInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            favorite: false,
            onShowModal: false,
            rating: 5,
            author: '',
            text: ''
        };

    }

    toggleModal() {
        this.setState({ onShowModal: !this.state.onShowModal });
    }

    handleComment(campsiteId) { 
        this.props.postComment(campsiteId, this.state.rating, this.state.author, this.state.comment) ;
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            rating: '',
            author: '',
            comment: '',
            imageSize: 40,
        })
    }


    static navigationOptions = {
    title: 'Campsite Information'
};

markFavorite(campsiteId) {
    this.props.postFavorite(campsiteId);
}

render() {
    const campsiteId = this.props.navigation.getParam('campsiteId');
    const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
    const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
    return (
        <ScrollView>
            <RenderCampsite campsite={campsite}
                onShowModal={() => this.toggleModal()}
                favorite={this.props.favorites.includes(campsiteId)}
                markFavorite={() => this.markFavorite(campsiteId)}
            />
            <RenderComments comments={comments} />
            <Modal
                animationType={'slide'}
                transparent={false}
                visible={this.state.onShowModal}
                onRequestClose={() => this.toggleModal()}>
                <View style={styles.modal}>
                    <Rating 
                        startingValue= {this.state.rating}
                        showRating
                        onFinishRating={(rating)=>this.setState({rating: rating})} 
                        style={{ paddingVertical: 10 }}
                    />
                    <Input 
                    placeholder='Author'
                    leftIcon= {{ type: 'font-awesome', name:'user-o'}}
                    leftIconContainerStyle={{paddingRight: 10}}
                    onChangeText={author => this.setState({author: author})}
                    value={this.state.author}
                    />
                    <Input 
                    placeholder='Comment'
                    leftIcon= {{ type: 'font-awesome', name:'comment-o'}}
                    leftIconContainerStyle={{paddingRight: 10}}
                    onChangeText={comment => this.setState({comment: comment})}
                    value={this.state.comment}
                    />
                    <View style={styles.buttonView}>
                    <Button
                    onPress={() => {
                        this.handleComment(campsiteId);
                        this.toggleModal();
                        this.resetForm();
                    }}
                    color='#5637DD'
                    title='Submit'/>
                    </View>
                    <View style={styles.buttonView}>
                        <Button
                            onPress={() => {
                                this.toggleModal();
                                this.resetForm();
                            }}
                            color='#808080'
                            title='Cancel'
                        />
                    </View>

                </View>
            </Modal>
        </ScrollView>
    );
}
}

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#5637DD',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    },
    cardRow: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    cardItem: {
        flex: 1,
        margin: 10
    },
    buttonView:{
        padding: 10
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);