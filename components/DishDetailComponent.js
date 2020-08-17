import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList,StyleSheet,Modal,Button,Alert, PanResponder } from 'react-native';
import { Card, Icon,Rating,Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite,postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';
const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
}
const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment:(dishId,rating,author,comment)=>dispatch(postComment(dishId,rating,author,comment))
})

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating 
                    readonly
                    imageSize={20}
                    startingValue={item.rating}
                    style={{ alignItems: 'flex-start' }}
                />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
        </Animatable.View>
    );
}

function RenderDish(props) {
    const dish = props.dish;
    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }
    const recognizeComment = ({moveX, moveY, dx, dy})=>{
        if(dx > 200)
            return true;
        else
            return false;
    }
    var viewRef;
    const handleViewRef = ref => viewRef = ref;
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },

        onPanResponderGrant: () => {viewRef.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            else if(recognizeComment(gestureState))
                {props.toggleModal()}
            return true;
        },
    })
        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000} {...panResponder.panHandlers} ref={handleViewRef}>
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.formRow}>
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                        <Icon
                            reverse
                            raised
                            name='pencil'
                            type='font-awesome'
                            color="#512DA8"
                            onPress={() => props.toggleModal()}
                        />
                    </View>
                </Card>
                </Animatable.View>
            );
        }
        else {
            return(<View></View>);
        }
}

class DishDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            favorites: [],
            showModal:false,
            userRating:'',
            author:'',
            comment:'',
        };
    }

    static navigationOptions = {
        title: 'Dish Details'
    };
    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }
    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }
    addComment(dishId) {
        console.log(JSON.stringify(this.state));
        this.props.postComment(dishId,this.state.userRating,this.state.author,this.state.comment);
        this.toggleModal();
    }
    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    showModal={this.state.showModal}
                    onPress={() => this.markFavorite(dishId)} 
                    onaddComment={()=>this.addComment(this.state.rating,this.state.author,this.state.comment)}
                    toggleModal={()=>this.toggleModal(this.state.showModal)}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal()}
                    onRequestClose = {() => this.toggleModal()}>
                    <View style = {styles.modal}>
                        <Rating 
                            showRating
                            type="star"
                            fractions={1}
                            startingValue={3}
                            style={{ paddingVertical: 10 }}
                            onFinishRating={rating => this.setState({userRating:rating})}    
                        />
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            onChangeText={value => this.setState({author:value})}
                        />
                        <Input
                            placeholder="Comment"
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            onChangeText={value => this.setState({ comment: value })}
                        />
                        <Button
                            raised 
                            onPress = {() =>{this.addComment(dishId)}}
                            color="#512DA8"
                            title="SUBMIT" 
                        />
                        <View style={styles.cancelButton}>
                            <Button 
                                raised
                                color="#808080"
                                onPress = {() =>{this.toggleModal()}}
                                title="CANCEL" 
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
modal: {
    justifyContent: 'center',
    margin: 20
},
cancelButton:{
    marginTop:10
}
})
export default connect(mapStateToProps,mapDispatchToProps)(DishDetail);